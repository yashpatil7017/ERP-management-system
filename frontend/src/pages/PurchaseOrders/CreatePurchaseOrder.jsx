import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './PurchaseOrders.css';

const EMPTY_ITEM = { product: '', quantity: 1, price: 0 };

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
}

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();

  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingMasterData, setLoadingMasterData] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMasterData() {
      setLoadingMasterData(true);
      setLoadingError('');

      try {
        const suppliersRequest = api.get('/api/suppliers/getSuppliers', {
          params: { page: 1, limit: 1000, search: '' },
        });

        // Support both requested endpoint and current backend endpoint in repo.
        const productsRequest = api
          .get('/api/products', { params: { page: 1, limit: 1000, search: '' } })
          .catch(() => api.get('/api/products/getproducts', { params: { page: 1, limit: 1000, search: '' } }));

        const [suppliersRes, productsRes] = await Promise.all([suppliersRequest, productsRequest]);

        if (cancelled) return;

        setSuppliers(suppliersRes?.data?.suppliers || []);
        setProducts(productsRes?.data?.products || []);
      } catch (error) {
        if (cancelled) return;
        setLoadingError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoadingMasterData(false);
      }
    }

    loadMasterData();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  }, [items]);

  function onProductChange(index, productId) {
    const selectedProduct = products.find((p) => p._id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              product: productId,
              price: selectedProduct?.price ? Number(selectedProduct.price) : 0,
              quantity: item.quantity || 1,
            }
          : item
      )
    );
  }

  function onQuantityChange(index, quantityValue) {
    const quantity = Math.max(1, Number(quantityValue) || 1);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function addRow() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    if (!supplierId) {
      toast.error('Please select a supplier');
      return false;
    }

    if (!items.length) {
      toast.error('Add at least one product');
      return false;
    }

    const invalidItem = items.find((item) => !item.product || !item.quantity || Number(item.quantity) <= 0);
    if (invalidItem) {
      toast.error('Please select product and quantity for all rows');
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        supplier: supplierId,
        items: items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
        })),
      };

      await api.post('/api/purchaseorders/createPurchaseOrder', payload);
      toast.success('Purchase order created successfully');
      navigate('/purchase-orders');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMasterData) {
    return (
      <div className="po-page">
        <div className="po-card po-loading">
          <div className="po-spinner" />
          <p>Loading suppliers and products...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="po-page">
        <div className="po-card po-empty">
          <h2 className="po-title" style={{ fontSize: '20px' }}>Failed to load form data</h2>
          <p style={{ color: '#dc2626', marginTop: 8 }}>{loadingError}</p>
          <Link to="/purchase-orders" className="po-btn" style={{ marginTop: 16 }}>
            Back to Purchase Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="po-page">
      <div className="po-card">
        <div className="po-header">
          <div>
            <h1 className="po-title">Create Purchase Order</h1>
            <p className="po-subtitle">Add supplier and products for this order.</p>
          </div>
          <Link to="/purchase-orders" className="po-btn">
            Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="po-form">
          <div>
            <div>
              <label className="po-field-label">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="po-select"
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name} {supplier.city ? `(${supplier.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="po-items">
            <div className="po-items-head">
              <div>Product</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Subtotal</div>
              <div style={{ textAlign: 'right' }}>Action</div>
            </div>

            <div>
              {items.map((item, index) => {
                const subtotal = Number(item.quantity || 0) * Number(item.price || 0);

                return (
                  <div key={`item-${index}`} className="po-item-row">
                    <div>
                      <label className="po-field-label">Product</label>
                      <select
                        value={item.product}
                        onChange={(e) => onProductChange(index, e.target.value)}
                        className="po-select"
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="po-field-label">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(index, e.target.value)}
                        className="po-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="po-field-label">Price</label>
                      <div className="po-value-box">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    <div>
                      <label className="po-field-label">Subtotal</label>
                      <div className="po-value-box">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={items.length === 1}
                        className="po-btn po-btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="po-header" style={{ marginBottom: 0 }}>
            <button
              type="button"
              onClick={addRow}
              className="po-btn"
            >
              Add Product Row
            </button>

            <div className="po-total">
              <p className="po-total-label">Total Amount</p>
              <p className="po-total-value">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="po-actions">
            <Link to="/purchase-orders" className="po-btn">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="po-btn po-btn-primary"
            >
              {submitting ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

