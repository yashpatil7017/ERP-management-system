import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { getCustomers, updateCustomer } from '../../services/customerService';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxNumber: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomer() {
      setLoading(true);
      setLoadError('');

      try {
        const customerFromState = location?.state?.customer;
        if (customerFromState?._id === id) {
          setFormData({
            name: customerFromState.name || '',
            email: customerFromState.email || '',
            phone: customerFromState.phone || '',
            address: customerFromState.address || '',
            city: customerFromState.city || '',
            taxNumber: customerFromState.taxNumber || '',
            isActive: Boolean(customerFromState.isActive),
          });
          return;
        }

        // Backend does not have a dedicated get-by-id endpoint.
        // We fetch a larger chunk and locate the target customer.
        const data = await getCustomers(1, 1000, '');
        const found = (data?.customers || []).find((item) => item._id === id);

        if (!found) {
          throw new Error('Customer not found');
        }

        if (cancelled) return;
        setFormData({
          name: found.name || '',
          email: found.email || '',
          phone: found.phone || '',
          address: found.address || '',
          city: found.city || '',
          taxNumber: found.taxNumber || '',
          isActive: Boolean(found.isActive),
        });
      } catch (error) {
        if (cancelled) return;
        setLoadError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCustomer();
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleSwitchChange(event) {
    setFormData((prev) => ({ ...prev, isActive: event.target.checked }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone is required';
    }

    if (!formData.city.trim()) {
      nextErrors.city = 'City is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await updateCustomer(id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        taxNumber: formData.taxNumber.trim(),
        isActive: formData.isActive,
      });

      toast.success('Customer updated successfully');
      navigate('/customers');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ py: 6 }}>
        <Typography variant="h6" fontWeight={600}>
          Error loading customer
        </Typography>
        <Typography color="error.main" mt={1}>
          {loadError}
        </Typography>
        <Button sx={{ mt: 2 }} component={Link} to="/customers" variant="outlined">
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Edit Customer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update existing customer profile.
          </Typography>
        </Box>
        <Button component={Link} to="/customers" variant="outlined" startIcon={<ArrowBack />}>
          Back to Customers
        </Button>
      </Stack>

      <Card elevation={2}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Number"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6} display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      color="success"
                    />
                  }
                  label={formData.isActive ? 'Active' : 'Inactive'}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={3}>
              <Button component={Link} to="/customers" variant="outlined" disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Customer'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

