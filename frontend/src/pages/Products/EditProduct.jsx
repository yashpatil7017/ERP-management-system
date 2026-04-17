import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

import api from '../../api/axios';
import Loader from '../../components/Loader';
import './Products.css';

const PRODUCTS_BASE = '/api/products';

function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const productFromState = location?.state?.product || null;

  const defaults = useMemo(
    () => ({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaults,
    mode: 'onTouched',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setLoadError('');
      try {
        if (productFromState?._id === id) {
          reset({
            name: productFromState?.name || '',
            description: productFromState?.description || '',
            price: productFromState?.price ?? '',
            stock: productFromState?.stock ?? '',
            category: productFromState?.category || '',
          });
          return;
        }

        // Backend does not expose GET /api/products/:id, so we fetch a larger page and find by id.
        // This keeps Edit working even on refresh/deep-linking.
        const res = await api.get(`${PRODUCTS_BASE}/getproducts`, {
          params: { page: 1, limit: 1000, search: '' },
        });

        const found = (res.data?.products || []).find((p) => p?._id === id);
        if (!found) {
          throw new Error('Product not found');
        }

        if (cancelled) return;
        reset({
          name: found?.name || '',
          description: found?.description || '',
          price: found?.price ?? '',
          stock: found?.stock ?? '',
          category: found?.category || '',
        });
      } catch (err) {
        if (cancelled) return;
        setLoadError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id, productFromState, reset]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
      };

      await api.put(`${PRODUCTS_BASE}/update/${id}`, payload);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="productsPage">
        <div className="erpCard">
          <div className="erpCard__body">
            <Loader text="Loading product..." />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="productsPage">
        <div className="productsHeader">
          <div className="productsHeader__title">
            <h1>Edit Product</h1>
            <p>Update product details.</p>
          </div>
          <div className="productsHeader__actions">
            <Link to="/products" className="btn btn--ghost">
              <FiArrowLeft /> Back to list
            </Link>
          </div>
        </div>

        <div className="erpCard">
          <div className="erpCard__body">
            <div className="emptyState">
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Error loading product</div>
              <div>{loadError}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="productsPage">
      <div className="productsHeader">
        <div className="productsHeader__title">
          <h1>Edit Product</h1>
          <p>Update product details and stock.</p>
        </div>

        <div className="productsHeader__actions">
          <Link to="/products" className="btn btn--ghost">
            <FiArrowLeft /> Back to list
          </Link>
        </div>
      </div>

      <div className="erpCard">
        <div className="erpCard__body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="formGrid">
              <div className="field">
                <label>Name</label>
                <input
                  className="input"
                  placeholder="e.g. Wireless Mouse"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
                />
                {errors.name && <div className="errorText">{errors.name.message}</div>}
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  className="textarea"
                  placeholder="Short product description…"
                  {...register('description', { required: 'Description is required', minLength: { value: 5, message: 'Description is too short' } })}
                />
                {errors.description && <div className="errorText">{errors.description.message}</div>}
              </div>

              <div className="field">
                <label>Price</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price', {
                    required: 'Price is required',
                    valueAsNumber: true,
                    validate: (v) => (Number.isFinite(v) && v >= 0 ? true : 'Price must be a valid number'),
                  })}
                />
                {errors.price && <div className="errorText">{errors.price.message}</div>}
              </div>

              <div className="field">
                <label>Stock</label>
                <input
                  className="input"
                  type="number"
                  step="1"
                  placeholder="0"
                  {...register('stock', {
                    required: 'Stock is required',
                    valueAsNumber: true,
                    validate: (v) =>
                      Number.isInteger(v) && v >= 0 ? true : 'Stock must be a whole number (0 or more)',
                  })}
                />
                {errors.stock && <div className="errorText">{errors.stock.message}</div>}
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Category</label>
                <input
                  className="input"
                  placeholder="e.g. Accessories"
                  {...register('category', { required: 'Category is required', minLength: { value: 2, message: 'Category is too short' } })}
                />
                {errors.category && <div className="errorText">{errors.category.message}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <Link to="/products" className="btn btn--ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? (
                  <>
                    <Loader size="sm" text="" /> Saving…
                  </>
                ) : (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

