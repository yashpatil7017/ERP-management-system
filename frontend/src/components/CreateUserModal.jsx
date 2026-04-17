import React, { useState } from 'react';

const ROLE_OPTIONS = ['admin', 'sales', 'purchase', 'inventory'];

export default function CreateUserModal({
  mode = 'create',
  initialData = null,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'sales',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (mode === 'create') {
      if (!form.password) next.password = 'Password is required';
      else if (form.password.length < 6) next.password = 'Minimum 6 characters required';
    }
    if (!form.role) next.role = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-title" style={{ fontSize: '20px', marginBottom: 12 }}>
          {mode === 'create' ? 'Create User' : 'Edit User'}
        </h3>

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            className="admin-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          {errors.name && <div className="admin-error">{errors.name}</div>}

          <input
            className="admin-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          {errors.email && <div className="admin-error">{errors.email}</div>}

          {mode === 'create' && (
            <>
              <input
                className="admin-input"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <div className="admin-error">{errors.password}</div>}
            </>
          )}

          <select
            className="admin-select"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          {errors.role && <div className="admin-error">{errors.role}</div>}

          <div className="admin-buttons" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" className="admin-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

