import api from '../api/axios';

const BASE_PATH = '/api/suppliers';

export async function getSuppliers(page = 1, limit = 10, search = '') {
  const response = await api.get(`${BASE_PATH}/getSuppliers`, {
    params: { page, limit, search },
  });
  return response.data;
}

export async function addSupplier(data) {
  const response = await api.post(`${BASE_PATH}/addSupplier`, data);
  return response.data;
}

export async function updateSupplier(id, data) {
  const response = await api.put(`${BASE_PATH}/updateSupplier/${id}`, data);
  return response.data;
}

export async function deleteSupplier(id) {
  const response = await api.delete(`${BASE_PATH}/deleteSupplier/${id}`);
  return response.data;
}

const supplierService = {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};

export default supplierService;

