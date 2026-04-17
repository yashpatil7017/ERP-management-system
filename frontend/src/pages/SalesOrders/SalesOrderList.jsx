import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './SalesOrderList.css';

const LIMIT = 10;
const STATUS_OPTIONS = ['', 'pending', 'shipped', 'delivered', 'cancelled'];

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

function getStatusClass(status) {
  if (status === 'shipped') return 'sales-status sales-status-shipped';
  if (status === 'delivered') return 'sales-status sales-status-delivered';
  if (status === 'cancelled') return 'sales-status sales-status-cancelled';
  return 'sales-status sales-status-pending';
}

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/salesorders/getSalesOrder', {
          params: {
            page,
            limit: LIMIT,
            search: search || undefined,
            status: status || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sortBy: 'createdAt',
            order: 'desc',
          },
        });

        if (cancelled) return;
        const data = response?.data || {};
        setOrders(data.salesOrders || []);
        setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        setTotalOrders(Number(data.totalOrders || 0));
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
  }, [page, search, status, startDate, endDate]);

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

  async function handleStatusChange(order, nextStatus) {
    if (!nextStatus || nextStatus === order.status) return;

    const confirmed = window.confirm(`Change status from "${order.status}" to "${nextStatus}"?`);
    if (!confirmed) return;

    setUpdatingId(order._id);
    try {
      await api.put(`/api/salesorders/updateOrderStatus/${order._id}`, {
        status: nextStatus,
      });

      toast.success(`Order status updated to ${nextStatus}`);
      setOrders((prev) =>
        prev.map((item) => (item._id === order._id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <div className="sales-list-container">
      <div className="sales-list-card">
        <div className="sales-list-header">
          <div>
            <h1 className="sales-list-title">Sales Orders</h1>
            <p className="sales-list-subtitle">Track customer orders and update fulfillment status.</p>
          </div>
          <Link to="/sales-orders/create" className="sales-list-btn sales-list-btn-primary">
            Create Sales Order
          </Link>
        </div>

        <div className="sales-list-toolbar">
          <input
            className="sales-list-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search customer name, email or order id"
          />
          <select
            className="sales-list-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            className="sales-list-input"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="sales-list-input"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            className="sales-list-btn"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setStatus('');
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="sales-list-loading">
            <div className="sales-list-spinner" />
            <p>Loading sales orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="sales-list-empty">
            <h2 className="sales-list-title" style={{ fontSize: '20px' }}>No sales orders found</h2>
            <p className="sales-list-subtitle">Try another filter or create a new order.</p>
          </div>
        ) : (
          <>
            <div className="sales-list-table-wrap">
              <table className="sales-list-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>SO-{String(order._id || '').slice(-6).toUpperCase()}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{order.customer?.name || '-'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{order.customer?.email || '-'}</div>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={getStatusClass(order.status)}>{order.status}</span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="sales-list-btn"
                            onClick={() => {
                              const products = (order.items || [])
                                .map((i) => `${i.product?.name || 'Unknown'} x ${i.quantity}`)
                                .join('\n');
                              window.alert(
                                `Order: SO-${String(order._id || '').slice(-6).toUpperCase()}\nCustomer: ${
                                  order.customer?.name || '-'
                                }\nStatus: ${order.status}\n\nItems:\n${products || 'No items'}`
                              );
                            }}
                          >
                            View
                          </button>
                          <select
                            className="sales-list-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            disabled={updatingId === order._id}
                          >
                            {STATUS_OPTIONS.filter(Boolean).map((st) => (
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

            <div className="sales-list-pagination">
              <p className="sales-list-subtitle" style={{ margin: 0 }}>
                Page {page} of {totalPages} ({totalOrders} total orders)
              </p>
              <div className="sales-list-pages">
                <button
                  type="button"
                  className="sales-list-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`sales-list-btn ${p === page ? 'sales-list-btn-primary' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="sales-list-btn"
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
    </div>
  );
}
