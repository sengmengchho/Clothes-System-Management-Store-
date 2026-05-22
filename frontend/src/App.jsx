import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import ProtectedRoute    from './components/ProtectedRoute';

import Home           from './pages/Home';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ProductDetail  from './pages/ProductDetail';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import OrderHistory   from './pages/OrderHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import SaleDashboard  from './pages/sale/SaleDashboard';

export default function App() {
  return (
    <AuthProvider>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Customer only */}
        <Route path="/cart"     element={
          <ProtectedRoute roles={['Customer']}>
            <Cart />
          </ProtectedRoute>} />

        <Route path="/checkout" element={
          <ProtectedRoute roles={['Customer']}>
            <Checkout />
          </ProtectedRoute>} />

        <Route path="/orders"   element={
          <ProtectedRoute roles={['Customer']}>
            <OrderHistory />
          </ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/admin"    element={
          <ProtectedRoute roles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>} />

        {/* Admin + Sale */}
        <Route path="/sale"     element={
          <ProtectedRoute roles={['Admin', 'Sale']}>
            <SaleDashboard />
          </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  );
}