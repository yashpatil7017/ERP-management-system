import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CircularProgress, Alert, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getSalesData } from '../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SalesChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getSalesData();
        if (!alive) return;
        setPayload(data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load sales chart');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const months = payload?.months ?? [];
    const sales = payload?.sales ?? [];
    return {
      labels: months,
      datasets: [
        {
          label: 'Sales',
          data: sales,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    };
  }, [payload]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Monthly Sales',
          color: '#0f172a',
          font: { size: 14, weight: '700' },
          padding: { bottom: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₹${Number(ctx.parsed.y || 0).toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' },
        },
        y: {
          grid: { color: 'rgba(100, 116, 139, 0.15)' },
          ticks: {
            color: '#64748b',
            callback: (v) => `₹${Number(v).toLocaleString()}`,
          },
        },
      },
    }),
    [],
  );

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 14px 26px rgba(15,23,42,0.06)' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ height: 320, position: 'relative' }}>
          {loading ? (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

