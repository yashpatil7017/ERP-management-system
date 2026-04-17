import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

import api from '../../api/axios';
import Loader from '../../components/Loader';
import './Products.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PRODUCTS_BASE = '/api/products';

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(num);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
}

function getTotalPages(total, limit) {
  const t = Number(total) || 0;
  const l = Number(limit) || 10;
  return Math.max(1, Math.ceil(t / l));
}

function buildPageNumbers(currentPage, totalPages) {
  const maxButtons = 7;
  const pages = [];
  const total = Number(totalPages) || 1;
  const current = Math.min(Math.max(1, Number(currentPage) || 1), total);

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

function ConfirmModal({ open, title, message, confirmText, cancelText, loading, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal__header">
          <h3>{title}</h3>
        </div>
        <div className="modal__body">{message}</div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [widgetsLoading, setWidgetsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = useMemo(() => getTotalPages(total, limit), [total, limit]);
  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages]);

  useEffect(() => {
    // Debounce search input to avoid hammering API on every keystroke.
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`${PRODUCTS_BASE}/getproducts`, {
          params: { page, limit, search },
        });

        if (cancelled) return;
        setProducts(res.data?.products || []);
        setTotal(res.data?.total ?? 0);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [page, limit, search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchWidgets() {
      setWidgetsLoading(true);
      try {
        const [topRes, lowRes] = await Promise.all([
          api.get(`${PRODUCTS_BASE}/top-selling`),
          api.get(`${PRODUCTS_BASE}/low-stock`),
        ]);

        if (cancelled) return;
        setTopSelling(Array.isArray(topRes.data) ? topRes.data : []);
        setLowStock(Array.isArray(lowRes.data) ? lowRes.data : []);
      } catch (err) {
        if (cancelled) return;
        // Widgets failing shouldn't break the whole page; keep it lightweight.
        toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setWidgetsLoading(false);
      }
    }

    fetchWidgets();
    return () => {
      cancelled = true;
    };
  }, []);

  function openDeleteModal(product) {
    setDeleteTarget(product);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deleting) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await api.delete(`${PRODUCTS_BASE}/delete/${deleteTarget._id}`);
      toast.success('Product deleted');
      closeDeleteModal();

      // Refresh current page. If we deleted the last item on a page, step back.
      const remaining = products.length - 1;
      if (remaining <= 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        // Re-fetch by triggering effect: easiest is to keep page same and update via fetch.
        // We can optimistically remove from UI immediately for snappier UX.
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setTotal((t) => Math.max(0, Number(t || 0) - 1));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const topSellingChart = useMemo(() => {
    const labels = topSelling.map((r) => r?.name ?? '—').slice(0, 10);
    const data = topSelling.map((r) => Number(r?.sold || 0)).slice(0, 10);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Units Sold',
            data,
            backgroundColor: 'rgba(37, 99, 235, 0.75)',
            borderRadius: 8,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.25)' }, ticks: { precision: 0 } },
        },
      },
    };
  }, [topSelling]);

  return (
    <div className="productsPage">
      <div className="productsHeader">
        <div className="productsHeader__title">
          <h1>Products</h1>
          <p>Manage inventory, pricing and stock levels.</p>
        </div>

        <div className="productsHeader__actions">
          <Link to="/products/new" className="btn btn--primary">
            <FiPlus /> Add Product
          </Link>
        </div>
      </div>

      <div className="widgetsGrid">
        <div className="erpCard">
          <div className="erpCard__body">
            <div className="widgetTitle">
              <h3>Top Selling Products</h3>
              <span className="pill">Last 10</span>
            </div>

            <div style={{ height: 220 }}>
              {widgetsLoading ? (
                <Loader size="sm" text="Loading top selling…" />
              ) : topSelling.length ? (
                <Bar data={topSellingChart.data} options={topSellingChart.options} />
              ) : (
                <div className="emptyState">No sales data yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="erpCard">
          <div className="erpCard__body">
            <div className="widgetTitle">
              <h3>⚠ Low Stock Products</h3>
              <span className="pill pill--warn">Monitor</span>
            </div>

            {widgetsLoading ? (
              <Loader size="sm" text="Loading low stock…" />
            ) : lowStock.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.slice(0, 8).map((p, idx) => (
                  <div
                    key={`${p?.name || 'p'}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: 10,
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p?.name || '—'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Stock: {p?.stock ?? p?.stockQuantity ?? '—'}</div>
                    </div>
                    <span className="pill pill--warn">Reorder</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="emptyState">No low-stock products.</div>
            )}
          </div>
        </div>
      </div>

      <div className="erpCard">
        <div className="toolbar">
          <div className="searchBox" aria-label="Search products">
            <FiSearch />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by name…"
            />
          </div>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setPage(1);
            }}
            disabled={loading && !error}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="erpCard__body">
            <Loader text="Loading products..." />
          </div>
        ) : error ? (
          <div className="erpCard__body">
            <div className="emptyState">
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Error loading products</div>
              <div>{error}</div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="erpCard__body">
            <div className="emptyState">
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>No products found</div>
              <div>Try a different search or add your first product.</div>
              <div style={{ marginTop: 12 }}>
                <Link to="/products/new" className="btn btn--primary">
                  <FiPlus /> Add Product
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLow = Number(p?.stock) < 5;
                    return (
                      <tr key={p._id} className={isLow ? 'rowLowStock' : ''}>
                        <td style={{ fontWeight: 800 }}>{p?.name || '—'}</td>
                        <td>{p?.category || '—'}</td>
                        <td>{formatMoney(p?.price)}</td>
                        <td>
                          <span className={isLow ? 'pill pill--warn' : 'pill'}>
                            {p?.stock ?? '—'}
                          </span>
                        </td>
                        <td>{formatDate(p?.createdAt)}</td>
                        <td>
                          <div className="actions">
                            <button
                              type="button"
                              className="iconBtn"
                              title="Edit"
                              onClick={() => navigate(`/products/${p._id}/edit`, { state: { product: p } })}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              className="iconBtn iconBtn--danger"
                              title="Delete"
                              onClick={() => openDeleteModal(p)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`pageBtn ${p === page ? 'pageBtn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductList;
