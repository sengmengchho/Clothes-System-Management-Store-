import api from './axios';

export const placeOrder = (shipping_address, items) =>
  api.post('/orders/', { shipping_address, items });

export const getMyOrders = () =>
  api.get('/orders/my/');

export const getOrderDetail = (id) =>
  api.get(`/orders/${id}/`);

// Admin / Sale
export const getAllOrders = (params) =>
  api.get('/orders/', { params });

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status/`, { status });

// Dashboard
export const getDashboardSummary = () =>
  api.get('/dashboard/summary/');

export const getLowStock = (threshold = 10) =>
  api.get('/dashboard/low-stock/', { params: { threshold } });

export const getRecentOrders = (limit = 10) =>
  api.get('/dashboard/recent-orders/', { params: { limit } });

export const getSalesByCategory = () =>
  api.get('/dashboard/sales-by-category/');