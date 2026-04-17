import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './PurchaseOrders.css';

const LIMIT = 10;
const STATUSES = ['ordered', 'received', 'cancelled'];

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date) {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function getStatusBadgeClass(status) {
  if (status === 'received') return 'po-badge po-badge-received';
  if (status === 'cancelled') return 'po-badge po-badge-cancelled';
  return 'po-badge po-badge-ordered';
}

export default function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingOrderId, setUpdatingOrderId] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/purchaseorders/getPurchaseOrders', {
          params: {
            page,
            limit: LIMIT,
            search: search || undefined,
            status: status || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sortBy,
            order,
          },
        });

        if (cancelled) return;

        const payload = response?.data || {};
        setOrders(payload.orders || []);
        setTotalPages(Math.max(1, Number(payload.totalPages) || 1));
        setTotalOrders(Number(payload.totalOrders) || 0);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [page, search, status, startDate, endDate, sortBy, order]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  async function handleStatusChange(orderItem, nextStatus) {
    if (!nextStatus || nextStatus === orderItem.status) return;

    const confirmed = window.confirm(
      `Change status from "${orderItem.status}" to "${nextStatus}" for order ${orderItem._id.slice(-6)}?`
    );
    if (!confirmed) return;

    setUpdatingOrderId(orderItem._id);
    try {
      await api.put(`/api/purchaseorders/updatePurchaseOrderStatus/${orderItem._id}`, {
        status: nextStatus,
      });

      toast.success(`Order status updated to ${nextStatus}`);
      setOrders((prev) =>
        prev.map((orderRow) =>
          orderRow._id === orderItem._id
            ? {
                ...orderRow,
                status: nextStatus,
              }
            : orderRow
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingOrderId('');
    }
  }

  return (
    <div className="po-page">
      <div className="po-card">
        <div className="po-header">
          <div>
            <h1 className="po-title">Purchase Orders</h1>
            <p className="po-subtitle">Track, filter, and update purchase orders.</p>
          </div>
          <Link to="/purchase-orders/new" className="po-btn po-btn-primary">
            Create Purchase Order
          </Link>
        </div>

        <div className="po-filters">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search supplier or product"
            className="po-input"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="po-select"
          >
            <option value="">All Status</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="po-input"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="po-input"
          />

          <button
            type="button"
            onClick={() => {
              setSortBy('createdAt');
              setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
            }}
            className="po-btn"
          >
            Date: {order === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {loading ? (
          <div className="po-loading">
            <div className="po-spinner" />
            <p>Loading purchase orders...</p>
          </div>
        ) : error ? (
          <div className="po-empty">
            <h2 className="po-title" style={{ fontSize: '20px' }}>Error loading purchase orders</h2>
            <p style={{ color: '#dc2626', marginTop: 8 }}>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="po-empty">
            <h2 className="po-title" style={{ fontSize: '20px' }}>No purchase orders found</h2>
            <p className="po-subtitle">Try changing your filters or create a new order.</p>
          </div>
        ) : (
          <>
            <div className="po-table-wrap">
              <table className="po-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Supplier Name</th>
                    <th>Products Count</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((orderItem) => (
                    <tr key={orderItem._id}>
                      <td style={{ fontWeight: 700 }}>
                        #{String(orderItem._id || '').slice(-6).toUpperCase()}
                      </td>
                      <td>{orderItem.supplier?.name || '-'}</td>
                      <td>{orderItem.items?.length || 0}</td>
                      <td style={{ fontWeight: 700 }}>
                        {formatCurrency(orderItem.totalAmount)}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(orderItem.status)}>
                          {orderItem.status}
                        </span>
                      </td>
                      <td>{formatDate(orderItem.createdAt)}</td>
                      <td>
                        <div className="po-table-actions">
                          <button
                            type="button"
                            onClick={() => {
                              const details = (orderItem.items || [])
                                .map(
                                  (item) =>
                                    `${item.product?.name || 'Unknown'} - Qty: ${item.quantity}, Price: ${formatCurrency(item.price)}`
                                )
                                .join('\n');
                              window.alert(
                                `Order #${String(orderItem._id || '').slice(-6).toUpperCase()}\nSupplier: ${
                                  orderItem.supplier?.name || '-'
                                }\nStatus: ${orderItem.status}\n\nItems:\n${details || 'No items'}`
                              );
                            }}
                            className="po-btn"
                          >
                            View Order
                          </button>

                          <select
                            value={orderItem.status}
                            onChange={(e) => handleStatusChange(orderItem, e.target.value)}
                            disabled={updatingOrderId === orderItem._id}
                            className="po-select"
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="po-pagination">
              <p className="po-subtitle" style={{ margin: 0 }}>
                Showing page {page} of {totalPages} ({totalOrders} total orders)
              </p>

              <div className="po-pagination-buttons">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="po-btn"
                >
                  Previous
                </button>

                {pageNumbers.map((pageNo) => (
                  <button
                    key={pageNo}
                    type="button"
                    onClick={() => setPage(pageNo)}
                    className={`po-btn ${pageNo === page ? 'po-page-btn-active' : ''}`}
                  >
                    {pageNo}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="po-btn"
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
