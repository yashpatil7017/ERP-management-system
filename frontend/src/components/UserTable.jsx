import React from 'react';

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

export default function UserTable({ users, onEdit, onToggleStatus }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{(user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1)}</td>
              <td>
                <span
                  className={`admin-badge ${
                    user.status === 'inactive' ? 'admin-badge-inactive' : 'admin-badge-active'
                  }`}
                >
                  {user.status === 'inactive' ? 'Inactive' : 'Active'}
                </span>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <div className="admin-buttons">
                  <button type="button" className="admin-btn" onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`admin-btn ${
                      user.status === 'inactive' ? 'admin-btn-primary' : 'admin-btn-danger'
                    }`}
                    onClick={() => onToggleStatus(user)}
                  >
                    {user.status === 'inactive' ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

