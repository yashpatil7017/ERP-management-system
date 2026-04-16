import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Unauthorized</h1>
      <p style={{ marginTop: 10, color: '#6b7280' }}>
        You don’t have permission to view this page.
      </p>
      <div style={{ marginTop: 16 }}>
        <Link to="/dashboard">Go back to Dashboard</Link>
      </div>
    </div>
  );
}

