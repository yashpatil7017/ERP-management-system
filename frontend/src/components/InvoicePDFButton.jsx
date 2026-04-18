import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    currencyDisplay: "code",
  }).format(value);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function InvoicePDFButton({ invoice, className = "invoice-btn" }) {
  const handleDownload = () => {
    if (!invoice) return;

    const doc = new jsPDF();

    // ===== HEADER =====
    doc.setFontSize(20);
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(11);
    doc.text("Skybrisk ERP Pvt Ltd", 14, 30);
    doc.text("Pune, Maharashtra, India", 14, 36);

    // ===== INVOICE DETAILS =====
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 140, 30);
    doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 140, 36);

    // ===== CUSTOMER =====
    doc.text("Bill To:", 14, 50);
    doc.text(invoice.customerName || "-", 14, 56);
    doc.text(invoice.customerEmail || "-", 14, 62);

    // ===== ITEMS TABLE =====

    const tableRows = (invoice.products || []).map((item) => [
      item.productName || "Product",
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.quantity * item.price),
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["Product", "Quantity", "Price", "Total"]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [40, 40, 40],
      },
    });

    // ===== TOTAL SECTION =====

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, finalY);
    doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 140, finalY + 6);
    doc.text(`Discount: ${formatCurrency(invoice.discount)}`, 140, finalY + 12);

    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, finalY + 20);

    // ===== FOOTER =====

    doc.setFontSize(10);
    doc.text("Thank you for your business!", 14, 280);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <button className={className} onClick={handleDownload}>
      Download PDF
    </button>
  );
}