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

import { deleteSupplier, getSuppliers } from '../../services/supplierService';

const PAGE_SIZE = 10;

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}

export default function SupplierList() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
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

    async function loadSuppliers() {
      setLoading(true);
      setError('');
      try {
        const data = await getSuppliers(page, PAGE_SIZE, search);
        if (cancelled) return;
        setSuppliers(data?.suppliers || []);
        setTotal(data?.total || 0);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSuppliers();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  function openDeleteDialog(supplier) {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setSelectedSupplier(null);
  }

  async function handleDeleteSupplier() {
    if (!selectedSupplier?._id) return;
    setDeleting(true);
    try {
      await deleteSupplier(selectedSupplier._id);
      toast.success('Supplier deleted successfully');
      closeDeleteDialog();

      if (suppliers.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setSuppliers((prev) => prev.filter((item) => item._id !== selectedSupplier._id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const showEmpty = !loading && !error && suppliers.length === 0;

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
            Suppliers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage supplier contacts and compliance details.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            placeholder="Search supplier"
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/suppliers/new')}>
            Add Supplier
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
                Error loading suppliers
              </Typography>
              <Typography variant="body2" color="error.main" mt={1}>
                {error}
              </Typography>
            </Box>
          ) : showEmpty ? (
            <Box sx={{ py: 8, textAlign: 'center', px: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                No suppliers found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Try another search or add a new supplier.
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
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{supplier.name || '-'}</TableCell>
                        <TableCell>{supplier.email || '-'}</TableCell>
                        <TableCell>{supplier.phone || '-'}</TableCell>
                        <TableCell>{supplier.city || '-'}</TableCell>
                        <TableCell>{supplier.taxNumber || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={supplier.isActive ? 'Active' : 'Inactive'}
                            color={supplier.isActive ? 'success' : 'error'}
                            variant={supplier.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              navigate(`/suppliers/edit/${supplier._id}`, {
                                state: { supplier },
                              })
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton color="error" onClick={() => openDeleteDialog(supplier)}>
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
                  Showing {suppliers.length} of {total} suppliers
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
        <DialogTitle>Delete supplier?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{selectedSupplier?.name || 'this supplier'}</strong>? This action cannot be
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
            onClick={handleDeleteSupplier}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
