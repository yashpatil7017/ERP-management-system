import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import InvoiceTable from '../components/InvoiceTable';
import '../styles/invoice.css';

const LIMIT = 10;

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInvoices() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/invoices', {
          params: { page, limit: LIMIT, search: search || undefined, status: status || undefined },
        });
        if (cancelled) return;
        const data = response?.data || {};
        setInvoices(data.invoices || []);
        setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        setTotal(Number(data.total || 0));
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInvoices();
    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  function handleView(invoice) {
    navigate(`/invoices/generate?salesOrderId=${invoice.salesOrderId}`);
  }

  async function handleDelete(invoice) {
    const confirmed = window.confirm(`Delete invoice ${invoice.invoiceNumber}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/invoices/${invoice._id}`);
      toast.success('Invoice deleted successfully');
      if (invoices.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setInvoices((prev) => prev.filter((item) => item._id !== invoice._id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="invoice-container">
      <div className="invoice-card">
        <div className="invoice-header">
          <div>
            <h1 className="invoice-title">Invoice Management</h1>
            <p className="invoice-subtitle">Manage generated invoices for sales orders.</p>
          </div>
          <Link to="/invoices/generate" className="invoice-btn invoice-btn-primary">
            Generate Invoice
          </Link>
        </div>

        <div className="invoice-toolbar">
          <input
            className="invoice-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by invoice no, customer or order id"
          />
          <select
            className="invoice-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="invoice-loading">
            <div className="invoice-spinner" />
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="invoice-empty">
            <h2 className="invoice-title" style={{ fontSize: '20px' }}>No invoices found</h2>
            <p className="invoice-subtitle">Try another filter or generate a new invoice.</p>
          </div>
        ) : (
          <>
            <InvoiceTable invoices={invoices} onView={handleView} onDelete={handleDelete} />
            <div className="invoice-pagination">
              <p className="invoice-subtitle" style={{ margin: 0 }}>
                Page {page} of {totalPages} ({total} total invoices)
              </p>
              <div className="invoice-page-buttons">
                <button
                  type="button"
                  className="invoice-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`invoice-btn ${p === page ? 'invoice-btn-primary' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="invoice-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

