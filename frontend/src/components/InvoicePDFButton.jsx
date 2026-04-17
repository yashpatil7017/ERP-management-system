import React from 'react';
import { jsPDF } from 'jspdf';

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

export default function InvoicePDFButton({ invoice, className = 'invoice-btn' }) {
  function handleDownload() {
    if (!invoice) return;

    const doc = new jsPDF();
    let y = 16;

    doc.setFontSize(20);
    doc.text('INVOICE', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text('Company: Skybrisk ERP Pvt Ltd', 14, y);
    y += 6;
    doc.text('Address: Pune, Maharashtra, India', 14, y);
    y += 10;

    doc.text(`Invoice No: ${invoice.invoiceNumber || '-'}`, 14, y);
    y += 6;
    doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 14, y);
    y += 10;

    doc.text('Customer:', 14, y);
    y += 6;
    doc.text(invoice.customerName || '-', 14, y);
    y += 6;
    doc.text(invoice.customerEmail || '-', 14, y);
    y += 10;

    doc.text('Items:', 14, y);
    y += 6;

    (invoice.products || []).forEach((item) => {
      const line = `${item.productName || 'Product'} x${item.quantity} = ${formatCurrency(item.total)}`;
      doc.text(line, 14, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 16;
      }
    });

    y += 6;
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 14, y);
    y += 6;
    doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 14, y);
    y += 6;
    doc.text(`Discount: ${formatCurrency(invoice.discount)}`, 14, y);
    y += 6;
    doc.text(`Total: ${formatCurrency(invoice.total)}`, 14, y);

    doc.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
  }

  return (
    <button type="button" className={className} onClick={handleDownload}>
      Download PDF
    </button>
  );
}

