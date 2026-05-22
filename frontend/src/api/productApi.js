import api from './axios';

export const getCategories = () =>
  api.get('/categories/');

export const getProducts = (params) =>
  api.get('/products/', { params });

export const getProductDetail = (id) =>
  api.get(`/products/${id}/`);

// Admin
export const createProduct = (data) =>
  api.post('/products/', data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}/`, data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}/`);

export const createVariant = (productId, data) =>
  api.post(`/products/${productId}/variants/`, data);

export const updateVariant = (variantId, data) =>
  api.put(`/variants/${variantId}/`, data);

export const deleteVariant = (variantId) =>
  api.delete(`/variants/${variantId}/`);