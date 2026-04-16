import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { getRecentOrders } from '../services/dashboardService';

function statusChip(statusRaw) {
  const status = String(statusRaw || '').toLowerCase();
  if (status === 'completed' || status === 'complete') return { label: 'Completed', color: 'success' };
  if (status === 'cancelled' || status === 'canceled') return { label: 'Cancelled', color: 'error' };
  return { label: statusRaw || 'Pending', color: 'warning' };
}

function formatDate(value) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? '-');
  return `₹${n.toLocaleString()}`;
}

export default function RecentOrdersTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getRecentOrders();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.orders;
        setOrders(Array.isArray(list) ? list.slice(0, 5) : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load recent orders');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 14px 26px rgba(15,23,42,0.06)' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 14, color: '#0f172a' }}>
            Recent Orders
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
            Latest 5 orders
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ height: 180, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((o) => {
                  const chip = statusChip(o?.status);
                  return (
                    <TableRow key={o?._id || o?.id || o?.orderId || o?.orderNo}>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {o?.orderId || o?.orderNo || o?.id || o?._id || '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {o?.customerName || o?.customer?.name || o?.customer || '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{formatDate(o?.date || o?.createdAt)}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {formatMoney(o?.totalAmount ?? o?.total ?? o?.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={chip.label} color={chip.color} sx={{ fontWeight: 900 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

