import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import InvoicePDFButton from '../components/InvoicePDFButton';
import '../styles/invoice.css';

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
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

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

export default function GenerateInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get('salesOrderId') || '';

  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSalesOrders() {
      setLoading(true);
      setLoadingError('');
      try {
        const response = await api.get('/api/salesorders/getSalesOrder', {
          params: { page: 1, limit: 500, sortBy: 'createdAt', order: 'desc' },
        });
        if (cancelled) return;
        setSalesOrders(response?.data?.salesOrders || []);
      } catch (error) {
        if (cancelled) return;
        setLoadingError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSalesOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedOrder = useMemo(
    () => salesOrders.find((order) => order._id === selectedOrderId) || null,
    [salesOrders, selectedOrderId]
  );

  const subtotal = useMemo(() => {
    if (!selectedOrder) return 0;
    return (selectedOrder.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0
    );
  }, [selectedOrder]);

  const tax = useMemo(() => subtotal * 0.18, [subtotal]);
  const grandTotal = useMemo(() => Math.max(0, subtotal + tax - Number(discount || 0)), [subtotal, tax, discount]);

  async function handleGenerateInvoice(event) {
    event.preventDefault();
    if (!selectedOrderId) {
      toast.error('Please select a sales order');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/api/invoices', {
        salesOrderId: selectedOrderId,
        status: paymentStatus,
        discount: Number(discount || 0),
      });
      const invoice = response?.data?.invoice;
      setCreatedInvoice(invoice || null);
      toast.success('Invoice created successfully');
      if (invoice?._id) {
        navigate('/invoices', { replace: true });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="invoice-container">
        <div className="invoice-card invoice-loading">
          <div className="invoice-spinner" />
          <p>Loading sales orders...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="invoice-container">
        <div className="invoice-card invoice-empty">
          <h2 className="invoice-title" style={{ fontSize: '20px' }}>Failed to load sales orders</h2>
          <p style={{ color: '#dc2626' }}>{loadingError}</p>
          <Link to="/invoices" className="invoice-btn" style={{ marginTop: 12 }}>
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-card">
        <div className="invoice-header">
          <div>
            <h1 className="invoice-title">Generate Invoice</h1>
            <p className="invoice-subtitle">Create invoice from an existing sales order.</p>
          </div>
          <Link to="/invoices" className="invoice-btn">Back to List</Link>
        </div>

        <form onSubmit={handleGenerateInvoice}>
          <div className="invoice-field-grid">
            <div className="invoice-field">
              <label>Sales Order</label>
              <select
                className="invoice-select"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                required
              >
                <option value="">Select sales order</option>
                {salesOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    SO-{String(order._id).slice(-6).toUpperCase()} | {order.customer?.name || 'Unknown'} | {formatDate(order.createdAt)}
                  </option>
                ))}
              </select>
            </div>

            <div className="invoice-field">
              <label>Invoice Date</label>
              <input className="invoice-input" readOnly value={formatDate(new Date())} />
            </div>
          </div>

          <div className="invoice-field-grid">
            <div className="invoice-field">
              <label>Customer Name</label>
              <input className="invoice-input" readOnly value={selectedOrder?.customer?.name || '-'} />
            </div>
            <div className="invoice-field">
              <label>Customer Email</label>
              <input className="invoice-input" readOnly value={selectedOrder?.customer?.email || '-'} />
            </div>
            <div className="invoice-field">
              <label>Customer Phone</label>
              <input className="invoice-input" readOnly value={selectedOrder?.customer?.phone || '-'} />
            </div>
            <div className="invoice-field">
              <label>Billing Address</label>
              <input className="invoice-input" readOnly value={selectedOrder?.customer?.city || '-'} />
            </div>
          </div>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {!selectedOrder ? (
                  <tr>
                    <td colSpan="4">Select a sales order to view products</td>
                  </tr>
                ) : (
                  (selectedOrder.items || []).map((item, idx) => (
                    <tr key={`${selectedOrder._id}-${idx}`}>
                      <td>{item.product?.name || 'Unknown Product'}</td>
                      <td>{item.quantity || 0}</td>
                      <td>{formatCurrency(item.price || 0)}</td>
                      <td>{formatCurrency(Number(item.quantity || 0) * Number(item.price || 0))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-field-grid" style={{ marginTop: 14 }}>
            <div className="invoice-field">
              <label>Payment Status</label>
              <select className="invoice-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="invoice-field">
              <label>Discount</label>
              <input
                className="invoice-input"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="invoice-summary">
            <div className="invoice-summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="invoice-summary-row"><span>Tax (18%)</span><strong>{formatCurrency(tax)}</strong></div>
            <div className="invoice-summary-row"><span>Discount</span><strong>{formatCurrency(discount)}</strong></div>
            <div className="invoice-summary-row"><span>Grand Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
          </div>

          <div className="invoice-buttons">
            <Link to="/invoices" className="invoice-btn">Cancel</Link>
            {createdInvoice && <InvoicePDFButton invoice={createdInvoice} className="invoice-btn" />}
            <button type="submit" className="invoice-btn invoice-btn-primary" disabled={submitting}>
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

