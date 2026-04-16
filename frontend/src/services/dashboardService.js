import axiosInstance from '../api/axios';

export async function getDashboardStats() {
  const res = await axiosInstance.get('/api/dashboard');
  return res.data;
}

export async function getSalesData() {
  const res = await axiosInstance.get('/api/dashboard/sales');
  return res.data;
}

export async function getTopProducts() {
  const res = await axiosInstance.get('/api/products/top-selling');
  return res.data;
}

export async function getRecentOrders() {
  const res = await axiosInstance.get('/api/salesorders/recent');
  return res.data;
}

export async function getLowStockProducts() {
  const res = await axiosInstance.get('/api/products/low-stock');
  return res.data;
}

