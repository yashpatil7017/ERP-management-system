import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';

export default function Unauthorized() {
  return (
    <section className="unauthorizedPage">
      <div className="unauthorizedCard">
        <h1 className="unauthorizedTitle">Access Denied</h1>
        <p className="unauthorizedText">
          You do not have permission to view this page.
        </p>
        <Link to="/dashboard" className="unauthorizedBtn">
          Go back to Dashboard
        </Link>
      </div>
    </section>
  );
}

