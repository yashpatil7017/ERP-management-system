import api from '../api/axios';

export async function getPurchaseOrders(params = {}) {
  const response = await api.get('/api/purchaseorders/getPurchaseOrders', {
    params: {
      page: params.page || 1,
      limit: params.limit || 100,
      search: params.search || '',
      status: params.status || undefined,
      sortBy: params.sortBy || 'createdAt',
      order: params.order || 'desc',
    },
  });
  return response.data;
}

export async function createGRN(payload) {
  const response = await api.post('/api/grn/createGRN', payload);
  return response.data;
}

export async function getGRNs(page = 1, limit = 10, search = '') {
  const response = await api.get('/api/grn/getGRNs', {
    params: { page, limit, search },
  });
  return response.data;
}

const grnService = {
  getPurchaseOrders,
  createGRN,
  getGRNs,
};

export default grnService;

