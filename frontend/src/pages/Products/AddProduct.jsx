import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function AddProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

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
    formState: { errors },
  } = useForm({
    defaultValues: defaults,
    mode: 'onTouched',
  });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
      };

      await api.post(`${PRODUCTS_BASE}/add`, payload);
      toast.success('Product created successfully');
      navigate('/products');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="productsPage">
      <div className="productsHeader">
        <div className="productsHeader__title">
          <h1>Add Product</h1>
          <p>Create a new product in your catalog.</p>
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
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader size="sm" text="" /> Saving…
                  </>
                ) : (
                  <>
                    <FiSave /> Create Product
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

