import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CircularProgress, Alert, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getTopProducts } from '../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopProductsChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTopProducts();
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load top products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const labels = items.map((p) => p?.name ?? 'Unknown');
    const values = items.map((p) => Number(p?.sold ?? 0));
    return {
      labels,
      datasets: [
        {
          label: 'Sold',
          data: values,
          backgroundColor: 'rgba(124, 58, 237, 0.75)',
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }, [items]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top Selling Products',
          color: '#0f172a',
          font: { size: 14, weight: '700' },
          padding: { bottom: 12 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' },
        },
        y: {
          grid: { color: 'rgba(100, 116, 139, 0.15)' },
          ticks: { color: '#64748b' },
        },
      },
    }),
    [],
  );

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 14px 26px rgba(15,23,42,0.06)' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ height: 320 }}>
          {loading ? (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

