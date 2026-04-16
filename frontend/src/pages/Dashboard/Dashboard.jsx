import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import StatCard from '../../components/StatCard';
import SalesChart from '../../components/SalesChart';
import TopProductsChart from '../../components/TopProductsChart';
import RecentOrdersTable from '../../components/RecentOrdersTable';
import LowStockAlert from '../../components/LowStockAlert';
import { getDashboardStats } from '../../services/dashboardService';

function IconEmoji({ children }) {
  return (
    <Box component="span" aria-hidden sx={{ fontSize: 20, lineHeight: 1 }}>
      {children}
    </Box>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getDashboardStats();
        if (!alive) return;
        setStats(data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard stats');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(() => {
    const totalProducts = stats?.totalProducts ?? stats?.products ?? 0;
    const totalCustomers = stats?.totalCustomers ?? stats?.customers ?? 0;
    const totalOrders = stats?.totalOrders ?? stats?.orders ?? 0;
    const totalRevenue = stats?.totalRevenue ?? stats?.revenue ?? 0;

    return [
      {
        title: 'Total Products',
        value: Number(totalProducts).toLocaleString(),
        color: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
        icon: <IconEmoji>📦</IconEmoji>,
      },
      {
        title: 'Total Customers',
        value: Number(totalCustomers).toLocaleString(),
        color: 'linear-gradient(135deg, #059669, #34d399)',
        icon: <IconEmoji>👥</IconEmoji>,
      },
      {
        title: 'Total Orders',
        value: Number(totalOrders).toLocaleString(),
        color: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
        icon: <IconEmoji>🧾</IconEmoji>,
      },
      {
        title: 'Total Revenue',
        value: `₹${Number(totalRevenue).toLocaleString()}`,
        color: 'linear-gradient(135deg, #ea580c, #fdba74)',
        icon: <IconEmoji>💰</IconEmoji>,
      },
    ];
  }, [stats]);

  return (
    <Box>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
          Real-time overview of products, customers, orders and revenue
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ height: 160, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {cards.map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title={c.title} value={c.value} icon={c.icon} color={c.color} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SalesChart />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TopProductsChart />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <RecentOrdersTable />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <LowStockAlert />
        </Grid>
      </Grid>
    </Box>
  );
}
