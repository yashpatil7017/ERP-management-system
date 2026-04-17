import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './CreateSalesOrder.css';

const EMPTY_ROW = { product: '', quantity: 1, price: 0 };

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

export default function CreateSalesOrder() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadMasterData() {
      setLoading(true);
      setLoadingError('');
      try {
        const customersReq = api
          .get('/api/customers')
          .catch(() => api.get('/api/customers/getcustomers', { params: { page: 1, limit: 1000, search: '' } }));

        const productsReq = api
          .get('/api/products')
          .catch(() => api.get('/api/products/getproducts', { params: { page: 1, limit: 1000, search: '' } }));

        const [customersRes, productsRes] = await Promise.all([customersReq, productsReq]);
        if (cancelled) return;

        const customersData = customersRes?.data?.customers || customersRes?.data || [];
        const productsData = productsRes?.data?.products || productsRes?.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        if (cancelled) return;
        setLoadingError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMasterData();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0), 0),
    [rows]
  );

  function clearFieldError(field) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleProductChange(index, productId) {
    const selected = products.find((product) => product._id === productId);
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, product: productId, price: Number(selected?.price || 0), quantity: row.quantity || 1 }
          : row
      )
    );
    clearFieldError(`row-${index}-product`);
    clearFieldError('duplicateProducts');
  }

  function handleQuantityChange(index, value) {
    const quantity = Math.max(0, Number(value) || 0);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, quantity } : row)));
    clearFieldError(`row-${index}-quantity`);
  }

  function addProductRow() {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  }

  function removeProductRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    let valid = true;
    const nextErrors = {};

    if (!customer) {
      valid = false;
      nextErrors.customer = 'Customer is required';
    }

    const productIds = [];
    rows.forEach((row, index) => {
      if (!row.product) {
        valid = false;
        nextErrors[`row-${index}-product`] = 'Product is required';
      } else {
        productIds.push(row.product);
      }
      if (!row.quantity || Number(row.quantity) <= 0) {
        valid = false;
        nextErrors[`row-${index}-quantity`] = 'Quantity must be greater than 0';
      }
    });

    const hasDuplicates = new Set(productIds).size !== productIds.length;
    if (hasDuplicates) {
      valid = false;
      nextErrors.duplicateProducts = 'Duplicate products are not allowed';
    }

    setErrors(nextErrors);
    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        customer,
        items: rows.map((row) => ({
          product: row.product,
          quantity: Number(row.quantity),
        })),
      };

      await api.post('/api/salesorders/createSalesOrder', payload);
      toast.success('Sales order created successfully');
      navigate('/sales-orders');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="sales-container">
        <div className="sales-card sales-loading">
          <div className="sales-spinner" />
          <p>Loading customers and products...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="sales-container">
        <div className="sales-card sales-empty">
          <h2 className="sales-title" style={{ fontSize: '20px' }}>Failed to load form data</h2>
          <p className="sales-error" style={{ fontSize: '14px' }}>{loadingError}</p>
          <Link to="/sales-orders" className="sales-btn" style={{ marginTop: 12 }}>
            Back to Sales Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-container">
      <div className="sales-card">
        <div className="sales-header">
          <div>
            <h1 className="sales-title">Create Sales Order</h1>
            <p className="sales-subtitle">Create a new customer order with multiple products.</p>
          </div>
          <Link to="/sales-orders" className="sales-btn">
            Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sales-field">
            <label className="sales-label">Customer</label>
            <select
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                clearFieldError('customer');
              }}
              className="sales-select"
            >
              <option value="">Select customer</option>
              {customers.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.email || 'no-email'})
                </option>
              ))}
            </select>
            {errors.customer && <div className="sales-error">{errors.customer}</div>}
          </div>

          <div className="sales-field">
            <label className="sales-label">Products</label>
            <div className="sales-table-wrap">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const subtotal = Number(row.price || 0) * Number(row.quantity || 0);
                    return (
                      <tr key={`row-${index}`}>
                        <td>
                          <select
                            value={row.product}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="sales-select"
                          >
                            <option value="">Select product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                          {errors[`row-${index}-product`] && (
                            <div className="sales-error">{errors[`row-${index}-product`]}</div>
                          )}
                        </td>
                        <td>{formatCurrency(row.price)}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="sales-input"
                          />
                          {errors[`row-${index}-quantity`] && (
                            <div className="sales-error">{errors[`row-${index}-quantity`]}</div>
                          )}
                        </td>
                        <td>{formatCurrency(subtotal)}</td>
                        <td>
                          <button
                            type="button"
                            className="sales-btn sales-btn-danger"
                            onClick={() => removeProductRow(index)}
                            disabled={rows.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {errors.duplicateProducts && <div className="sales-error">{errors.duplicateProducts}</div>}
          </div>

          <div className="sales-actions">
            <button type="button" className="sales-btn" onClick={addProductRow}>
              Add Product
            </button>

            <div className="sales-summary">
              <div className="sales-summary-box">
                <p>Total Amount</p>
                <h3>{formatCurrency(totalAmount)}</h3>
              </div>
            </div>
          </div>

          <div className="sales-actions" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
            <Link to="/sales-orders" className="sales-btn">Cancel</Link>
            <button type="submit" className="sales-btn sales-btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

