import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { deleteCustomer, getCustomers } from '../../services/customerService';

const PAGE_SIZE = 10;

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

export default function CustomerList() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setLoading(true);
      setError('');

      try {
        const data = await getCustomers(page, PAGE_SIZE, search);
        if (cancelled) return;

        setCustomers(data?.customers || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCustomers();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  function openDeleteDialog(customer) {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  }

  async function handleDeleteCustomer() {
    if (!selectedCustomer?._id) return;

    setDeleting(true);
    try {
      await deleteCustomer(selectedCustomer._id);
      toast.success('Customer deleted successfully');
      closeDeleteDialog();

      if (customers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setCustomers((prev) => prev.filter((item) => item._id !== selectedCustomer._id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const showEmpty = !loading && !error && customers.length === 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer master data.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            placeholder="Search customer"
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/customers/new')}
          >
            Add Customer
          </Button>
        </Stack>
      </Stack>

      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ py: 8, textAlign: 'center', px: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Error loading customers
              </Typography>
              <Typography variant="body2" color="error.main" mt={1}>
                {error}
              </Typography>
            </Box>
          ) : showEmpty ? (
            <Box sx={{ py: 8, textAlign: 'center', px: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                No customers found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Try a different search keyword or add a new customer.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Tax Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{customer.name || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>{customer.city || '-'}</TableCell>
                        <TableCell>{customer.taxNumber || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={customer.isActive ? 'Active' : 'Inactive'}
                            color={customer.isActive ? 'success' : 'default'}
                            variant={customer.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              navigate(`/customers/edit/${customer._id}`, {
                                state: { customer },
                              })
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(customer)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {customers.length} of {total} customers
                </Typography>
                <Pagination
                  page={page}
                  count={totalPages}
                  color="primary"
                  onChange={(_, value) => setPage(value)}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete customer?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{selectedCustomer?.name || 'this customer'}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCustomer}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
