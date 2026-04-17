import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useAuth from '../context/useAuth';
import CreateUserModal from '../components/CreateUserModal';
import UserTable from '../components/UserTable';
import '../styles/admin.css';

const LIMIT = 10;

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

export default function UserManagement() {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/users', {
          params: {
            page,
            limit: LIMIT,
            search: search || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
          },
        });
        if (cancelled) return;
        const data = response?.data || {};
        setUsers(data.users || []);
        setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        setTotal(Number(data.total || 0));
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page, search, roleFilter, statusFilter]);

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

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  function openCreate() {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  }

  function openEdit(user) {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  }

  async function handleModalSubmit(payload) {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await api.post('/api/users', payload);
        toast.success('User created successfully');
      } else if (selectedUser?._id) {
        await api.put(`/api/users/${selectedUser._id}`, {
          name: payload.name,
          email: payload.email,
          role: payload.role,
        });
        toast.success('User updated successfully');
      }
      setModalOpen(false);
      setSelectedUser(null);
      setPage(1);
      const response = await api.get('/api/users', {
        params: {
          page: 1,
          limit: LIMIT,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      const data = response?.data || {};
      setUsers(data.users || []);
      setTotalPages(Math.max(1, Number(data.totalPages || 1)));
      setTotal(Number(data.total || 0));
    } catch (errorResp) {
      toast.error(getErrorMessage(errorResp));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(user) {
    const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
    const confirmed = window.confirm(
      `${nextStatus === 'inactive' ? 'Deactivate' : 'Activate'} user "${user.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.patch(`/api/users/${user._id}/status`, { status: nextStatus });
      toast.success(`User ${nextStatus === 'inactive' ? 'deactivated' : 'activated'} successfully`);
      setUsers((prev) =>
        prev.map((item) => (item._id === user._id ? { ...item, status: nextStatus, isActive: nextStatus === 'active' } : item))
      );
    } catch (errorResp) {
      toast.error(getErrorMessage(errorResp));
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">User Management</h1>
            <p className="admin-subtitle">Manage ERP system users and permissions</p>
          </div>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
            + Create User
          </button>
        </div>

        <div className="admin-filters">
          <input
            className="admin-input"
            placeholder="Search by name/email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
            <option value="purchase">Purchase</option>
            <option value="inventory">Inventory</option>
          </select>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <h2 className="admin-title" style={{ fontSize: '20px' }}>No users found</h2>
            <p className="admin-subtitle">Try another filter or create a new user.</p>
          </div>
        ) : (
          <>
            <UserTable users={users} onEdit={openEdit} onToggleStatus={handleToggleStatus} />
            <div className="admin-pagination">
              <p className="admin-subtitle" style={{ margin: 0 }}>
                Page {page} of {totalPages} ({total} total users)
              </p>
              <div className="admin-pages">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`admin-btn ${p === page ? 'admin-btn-primary' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="admin-btn"
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

      {modalOpen && (
        <CreateUserModal
          key={`${modalMode}-${selectedUser?._id || 'new'}`}
          mode={modalMode}
          initialData={selectedUser}
          submitting={submitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}

