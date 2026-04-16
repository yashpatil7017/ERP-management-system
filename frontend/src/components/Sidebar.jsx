import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/sales-orders', label: 'Sales Orders' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/grn', label: 'GRN' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/admin', label: 'Admin' },
];

export default function Sidebar({ isOpen = true, onNavigate }) {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">
          ERP
        </div>
        <div className="sidebar__brandText">
          <div className="sidebar__title">ERP System</div>
          <div className="sidebar__subtitle">
            {currentUser?.name || currentUser?.email || 'Authenticated User'}
          </div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Sidebar navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            onClick={onNavigate}
          >
            <span className="sidebar__linkLabel">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
