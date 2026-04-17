import React from 'react';
import InvoicePDFButton from './InvoicePDFButton';

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
  if (status === 'paid') return 'invoice-status invoice-status-paid';
  if (status === 'pending') return 'invoice-status invoice-status-pending';
  return 'invoice-status invoice-status-unpaid';
}

export default function InvoiceTable({ invoices, onView, onDelete }) {
  return (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Sales Order ID</th>
            <th>Invoice Date</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td>{invoice.invoiceNumber || '-'}</td>
              <td>{invoice.customerName || '-'}</td>
              <td>SO-{String(invoice.salesOrderId || '').slice(-6).toUpperCase()}</td>
              <td>{formatDate(invoice.invoiceDate)}</td>
              <td>{formatCurrency(invoice.total)}</td>
              <td>
                <span className={getStatusClass(invoice.status)}>{invoice.status}</span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="invoice-btn" onClick={() => onView(invoice)}>
                    View
                  </button>
                  <InvoicePDFButton invoice={invoice} className="invoice-btn" />
                  <button
                    type="button"
                    className="invoice-btn invoice-btn-danger"
                    onClick={() => onDelete(invoice)}
                  >
                    Delete
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

