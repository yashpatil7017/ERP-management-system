import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createGRN, getPurchaseOrders } from '../../services/grnService';
import './GRN.css';

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

function getCurrentUserInfo() {
  try {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return { id: '', name: '' };
    const user = JSON.parse(userRaw);
    return {
      id: user?._id || user?.id || '',
      name: user?.name || user?.email || '',
    };
  } catch {
    return { id: '', name: '' };
  }
}

export default function CreateGRN() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUserInfo(), []);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [receivedBy, setReceivedBy] = useState(currentUser.id);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPurchaseOrders() {
      setLoading(true);
      setLoadingError('');
      try {
        const data = await getPurchaseOrders({ status: 'ordered', limit: 500 });
        if (cancelled) return;

        const orderedOnly = (data?.orders || []).filter((order) => order.status === 'ordered');
        setPurchaseOrders(orderedOnly);
      } catch (error) {
        if (cancelled) return;
        setLoadingError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPurchaseOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  function handlePurchaseOrderChange(poId) {
    setSelectedPO(poId);
    setErrors({});

    const selectedOrder = purchaseOrders.find((order) => order._id === poId);
    if (!selectedOrder) {
      setSupplierName('');
      setItems([]);
      return;
    }

    setSupplierName(selectedOrder?.supplier?.name || 'Unknown Supplier');

    const mappedItems = (selectedOrder.items || []).map((item, index) => ({
      id: `${poId}-${index}`,
      product: item?.product?._id || item?.product || '',
      productName: item?.product?.name || 'Unknown Product',
      orderedQty: Number(item?.quantity || 0),
      receivedQty: Number(item?.quantity || 0),
      damageQty: 0,
      acceptedQty: Number(item?.quantity || 0),
    }));

    setItems(mappedItems);
  }

  function setItemError(itemId, field, message) {
    setErrors((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: message,
      },
    }));
  }

  function clearItemError(itemId, field) {
    setErrors((prev) => {
      const itemErrors = { ...(prev[itemId] || {}) };
      delete itemErrors[field];
      const next = { ...prev };
      if (Object.keys(itemErrors).length) next[itemId] = itemErrors;
      else delete next[itemId];
      return next;
    });
  }

  function handleQtyChange(itemId, field, value) {
    const numericValue = Math.max(0, Number(value) || 0);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const nextItem = { ...item, [field]: numericValue };
        const receivedQty = Number(field === 'receivedQty' ? numericValue : nextItem.receivedQty);
        const damageQty = Number(field === 'damageQty' ? numericValue : nextItem.damageQty);
        const orderedQty = Number(nextItem.orderedQty);

        if (receivedQty > orderedQty) {
          setItemError(itemId, 'receivedQty', 'Received qty cannot exceed ordered qty');
        } else {
          clearItemError(itemId, 'receivedQty');
        }

        if (damageQty > receivedQty) {
          setItemError(itemId, 'damageQty', 'Damage qty cannot exceed received qty');
        } else {
          clearItemError(itemId, 'damageQty');
        }

        nextItem.acceptedQty = Math.max(0, receivedQty - damageQty);
        return nextItem;
      })
    );
  }

  const totalAcceptedQty = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.acceptedQty || 0), 0),
    [items]
  );
  const totalDamagedQty = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.damageQty || 0), 0),
    [items]
  );

  function validateBeforeSubmit() {
    if (!selectedPO) {
      toast.error('Please select a purchase order');
      return false;
    }

    if (!items.length) {
      toast.error('No items found in selected purchase order');
      return false;
    }

    if (!receivedBy) {
      toast.error('Received By is required');
      return false;
    }

    for (const item of items) {
      if (item.receivedQty < 0 || item.damageQty < 0) {
        toast.error('Received and damage qty must be 0 or more');
        return false;
      }
      if (item.receivedQty > item.orderedQty) {
        toast.error(`Received qty cannot exceed ordered qty for ${item.productName}`);
        return false;
      }
      if (item.damageQty > item.receivedQty) {
        toast.error(`Damage qty cannot exceed received qty for ${item.productName}`);
        return false;
      }
    }

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before submitting');
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateBeforeSubmit()) return;

    setSubmitting(true);
    try {
      const payload = {
        purchaseOrderId: selectedPO,
        items: items.map((item) => ({
          product: item.product,
          orderedQty: Number(item.orderedQty),
          receivedQty: Number(item.receivedQty),
          damageQty: Number(item.damageQty),
        })),
        receivedBy,
        remarks: remarks.trim(),
      };

      await createGRN(payload);
      toast.success('GRN created successfully');
      navigate('/grn');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="grn-page">
        <div className="grn-card grn-loading">
          <div className="grn-spinner" />
          <p>Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="grn-page">
        <div className="grn-card grn-empty">
          <h2 className="grn-title" style={{ fontSize: '20px' }}>Error loading purchase orders</h2>
          <p className="grn-error" style={{ fontSize: '14px' }}>{loadingError}</p>
          <Link to="/grn" className="grn-btn" style={{ marginTop: 12 }}>
            Back to GRN List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grn-page">
      <div className="grn-card">
        <div className="grn-header">
          <div>
            <h1 className="grn-title">Create Goods Received Note (GRN)</h1>
            <p className="grn-subtitle">Receive goods against an ordered purchase order.</p>
          </div>
          <Link to="/grn" className="grn-btn">
            Back to GRN List
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grn-grid">
            <div className="grn-field">
              <label>Purchase Order</label>
              <select
                value={selectedPO}
                onChange={(e) => handlePurchaseOrderChange(e.target.value)}
                className="grn-select"
                required
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    PO-{order._id.slice(-6).toUpperCase()} ({order.supplier?.name || 'Unknown'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grn-field">
              <label>Supplier</label>
              <input className="grn-input" value={supplierName} readOnly placeholder="Auto filled" />
            </div>

            <div className="grn-field">
              <label>Received By</label>
              <input
                className="grn-input"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder={currentUser.name || 'User ID'}
                required
              />
            </div>
          </div>

          <div className="grn-table-wrap">
            <table className="grn-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Ordered Qty</th>
                  <th>Received Qty</th>
                  <th>Damage Qty</th>
                  <th>Accepted Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5">Select a purchase order to load products.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.orderedQty}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.receivedQty}
                          onChange={(e) => handleQtyChange(item.id, 'receivedQty', e.target.value)}
                          className="grn-input"
                        />
                        {errors[item.id]?.receivedQty && (
                          <div className="grn-error">{errors[item.id].receivedQty}</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.damageQty}
                          onChange={(e) => handleQtyChange(item.id, 'damageQty', e.target.value)}
                          className="grn-input"
                        />
                        {errors[item.id]?.damageQty && (
                          <div className="grn-error">{errors[item.id].damageQty}</div>
                        )}
                      </td>
                      <td>{item.acceptedQty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="grn-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="grn-field">
              <label>Remarks</label>
              <textarea
                className="grn-textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any notes about received goods..."
              />
            </div>
          </div>

          <div className="grn-summary">
            <div className="grn-summary-item">
              <p>Total Accepted Quantity</p>
              <h4>{totalAcceptedQty}</h4>
            </div>
            <div className="grn-summary-item">
              <p>Total Damaged Quantity</p>
              <h4>{totalDamagedQty}</h4>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Link to="/grn" className="grn-btn">Cancel</Link>
            <button type="submit" className="grn-btn grn-btn-success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit GRN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

