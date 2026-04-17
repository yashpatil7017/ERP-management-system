import api from '../api/axios';

const BASE_PATH = '/api/customers';

export async function getCustomers(page = 1, limit = 10, search = '') {
  const response = await api.get(`${BASE_PATH}/getcustomers`, {
    params: { page, limit, search },
  });
  return response.data;
}

export async function addCustomer(customerData) {
  const response = await api.post(`${BASE_PATH}/addcustomer`, customerData);
  return response.data;
}

export async function updateCustomer(id, customerData) {
  const response = await api.put(`${BASE_PATH}/updatecustomer/${id}`, customerData);
  return response.data;
}

export async function deleteCustomer(id) {
  const response = await api.delete(`${BASE_PATH}/deletecustomer/${id}`);
  return response.data;
}

const customerService = {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
};

export default customerService;

