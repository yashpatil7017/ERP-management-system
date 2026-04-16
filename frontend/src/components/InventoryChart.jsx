import React, { useMemo } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function InventoryChart() {
  const data = useMemo(
    () => ({
      labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
      datasets: [
        {
          label: 'Stock',
          data: [120, 90, 50, 30, 10],
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',
            'rgba(59, 130, 246, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(239, 68, 68, 0.75)',
            'rgba(244, 63, 94, 0.75)',
          ],
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    [],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Inventory Stock',
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
    <div className="chartCard">
      <div className="chartCard__body">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

