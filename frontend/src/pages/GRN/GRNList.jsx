import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getGRNs } from '../../services/grnService';
import './GRN.css';

const LIMIT = 10;

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function mapProductName(item, products) {
  const productId = String(item?.product || '');
  const matched = (products || []).find((p) => String(p?._id) === productId);
  return matched?.name || 'Unknown Product';
}

export default function GRNList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedGRN, setSelectedGRN] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchGRNs() {
      setLoading(true);
      setError('');
      try {
        const data = await getGRNs(page, LIMIT, search);
        if (cancelled) return;
        setGrns(data?.grns || []);
        setTotalPages(Math.max(1, Number(data?.totalPages || 1)));
        setTotal(Number(data?.total || 0));
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGRNs();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const sortedGRNs = useMemo(() => {
    const rows = [...grns];
    rows.sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
    return rows;
  }, [grns, sortOrder]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="grn-page">
      <div className="grn-card">
        <div className="grn-header">
          <div>
            <h1 className="grn-title">Goods Received Notes (GRN)</h1>
            <p className="grn-subtitle">Track all received inventory against purchase orders.</p>
          </div>
          <Link to="/grn/create" className="grn-btn grn-btn-primary">
            Create GRN
          </Link>
        </div>

        <div className="grn-toolbar">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="grn-input"
            placeholder="Search by supplier, order id, received by..."
          />
          <button
            type="button"
            className="grn-btn"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          >
            Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {loading ? (
          <div className="grn-loading">
            <div className="grn-spinner" />
            <p>Loading GRN records...</p>
          </div>
        ) : sortedGRNs.length === 0 ? (
          <div className="grn-empty">
            <h2 className="grn-title" style={{ fontSize: '20px' }}>No GRN records found</h2>
            <p className="grn-subtitle">Try changing search or create a new GRN.</p>
          </div>
        ) : (
          <>
            <div className="grn-table-wrap">
              <table className="grn-table">
                <thead>
                  <tr>
                    <th>GRN ID</th>
                    <th>Purchase Order</th>
                    <th>Supplier</th>
                    <th>Total Items</th>
                    <th>Received By</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGRNs.map((grn) => (
                    <tr key={grn._id}>
                      <td>GRN-{String(grn._id || '').slice(-6).toUpperCase()}</td>
                      <td>PO-{String(grn.purchaseOrder?._id || '').slice(-6).toUpperCase()}</td>
                      <td>{grn.supplier?.name || '-'}</td>
                      <td>{grn.items?.length || 0}</td>
                      <td>{grn.receivedBy || '-'}</td>
                      <td>{formatDate(grn.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="grn-btn"
                          onClick={() => setSelectedGRN(grn)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grn-pagination">
              <p className="grn-subtitle" style={{ margin: 0 }}>
                Page {page} of {totalPages} ({total} total GRNs)
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="grn-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`grn-btn ${p === page ? 'grn-btn-primary' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="grn-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedGRN && (
        <div className="grn-modal-backdrop" onClick={() => setSelectedGRN(null)}>
          <div className="grn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="grn-header" style={{ marginBottom: 12 }}>
              <h2 className="grn-title" style={{ fontSize: '20px' }}>
                GRN-{String(selectedGRN._id || '').slice(-6).toUpperCase()}
              </h2>
              <button type="button" className="grn-btn" onClick={() => setSelectedGRN(null)}>
                Close
              </button>
            </div>

            <div className="grn-grid">
              <div className="grn-field">
                <label>Purchase Order</label>
                <input
                  className="grn-input"
                  readOnly
                  value={`PO-${String(selectedGRN.purchaseOrder?._id || '').slice(-6).toUpperCase()}`}
                />
              </div>
              <div className="grn-field">
                <label>Supplier</label>
                <input className="grn-input" readOnly value={selectedGRN.supplier?.name || '-'} />
              </div>
              <div className="grn-field">
                <label>Received By</label>
                <input className="grn-input" readOnly value={selectedGRN.receivedBy || '-'} />
              </div>
              <div className="grn-field">
                <label>Remarks</label>
                <input className="grn-input" readOnly value={selectedGRN.remarks || '-'} />
              </div>
            </div>

            <div className="grn-table-wrap">
              <table className="grn-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Ordered</th>
                    <th>Received</th>
                    <th>Damaged</th>
                    <th>Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedGRN.items || []).map((item, idx) => {
                    const accepted = Number(item.receivedQty || 0) - Number(item.damageQty || 0);
                    return (
                      <tr key={`${selectedGRN._id}-${idx}`}>
                        <td>{mapProductName(item, selectedGRN.products)}</td>
                        <td>{item.orderedQty || 0}</td>
                        <td>{item.receivedQty || 0}</td>
                        <td>{item.damageQty || 0}</td>
                        <td>{accepted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
