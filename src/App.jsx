import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import MerchantLayout from './components/merchant/MerchantLayout';
import DashboardPage from './pages/merchant/DashboardPage';
import ProductListPage from './pages/merchant/ProductListPage';
import ProductFormPage from './pages/merchant/ProductFormPage';
import CategoryManagePage from './pages/merchant/CategoryManagePage';
import OrderQueuePage from './pages/merchant/OrderQueuePage';
import OrderHistoryPage from './pages/merchant/OrderHistoryPage';
import OpeningHoursPage from './pages/merchant/OpeningHoursPage';

import ClientLayout from './components/client/ClientLayout';
import CatalogPage from './pages/client/CatalogPage';
import ProductDetailPage from './pages/client/ProductDetailPage';
import CartPage from './pages/client/CartPage';
import OrderConfirmationPage from './pages/client/OrderConfirmationPage';
import MyOrdersPage from './pages/client/MyOrdersPage';
import PickupAddressPage from './pages/client/PickupAddressPage';

function DefaultRedirect() {
  const { user, userDoc, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (userDoc?.role === 'merchant') return <Navigate to="/merchant/dashboard" replace />;
  return <Navigate to="/client/catalog" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Default Route */}
            <Route path="/" element={<DefaultRedirect />} />

            {/* Merchant Routes (Phase 2) */}
            <Route path="/merchant" element={<ProtectedRoute role="merchant"><MerchantLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="categories" element={<CategoryManagePage />} />
              <Route path="orders" element={<OrderQueuePage />} />
              <Route path="orders/history" element={<OrderHistoryPage />} />
              <Route path="schedule" element={<OpeningHoursPage />} />
            </Route>
            
            {/* Client Routes (Phase 3) */}
            <Route path="/client" element={<ProtectedRoute role="client"><ClientLayout /></ProtectedRoute>}>
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="catalog/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:id/confirmation" element={<OrderConfirmationPage />} />
              <Route path="addresses" element={<PickupAddressPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
