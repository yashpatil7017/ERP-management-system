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
import { getLowStockProducts } from '../services/dashboardService';

function stockStatus(qtyRaw) {
  const qty = Number(qtyRaw ?? 0);
  if (qty < 10) return { label: 'Critical', color: 'error', rowBg: 'rgba(239, 68, 68, 0.10)' };
  if (qty < 20) return { label: 'Low', color: 'warning', rowBg: 'rgba(245, 158, 11, 0.10)' };
  return { label: 'OK', color: 'success', rowBg: 'transparent' };
}

export default function LowStockAlert() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getLowStockProducts();
        if (!alive) return;
        const list = Array.isArray(data) ? data : data?.products;
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load low stock products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => items, [items]);

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 14px 26px rgba(15,23,42,0.06)' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 14, color: '#0f172a' }}>
            Low Stock Alerts
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
            Stock &lt; 20 flagged
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
            <Table size="small" sx={{ minWidth: 520 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Stock Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((p) => {
                  const qty = p?.stockQuantity ?? p?.stock ?? p?.quantity ?? 0;
                  const st = stockStatus(qty);
                  return (
                    <TableRow
                      key={p?._id || p?.id || p?.name}
                      sx={{ bgcolor: st.rowBg }}
                    >
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{p?.name || p?.productName || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{qty}</TableCell>
                      <TableCell>
                        <Chip size="small" label={st.label} color={st.color} sx={{ fontWeight: 900 }} />
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

