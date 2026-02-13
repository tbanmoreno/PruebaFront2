import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Páginas
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register'; // Nueva importación
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Success from '../pages/Success';
import OrderHistory from '../pages/profile/OrderHistory';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import DashboardHome from '../pages/admin/DashboardHome';
import ProductManagement from '../pages/admin/ProductManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import ClientManagement from '../pages/admin/ClientManagement';
import InvoiceManagement from '../pages/admin/InvoiceManagement';
import SupplierManagement from '../pages/admin/SupplierManagement';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  
  return children;
};

const AppRouter = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={
            isAdmin ? <Navigate to="/admin" replace /> : <Home />
          } />
          
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} /> {/* Nueva Ruta */}
          <Route path="/tienda" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          
          <Route path="/success" element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } />

          <Route path="/perfil/historial" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="productos" element={<ProductManagement />} />
          <Route path="pedidos" element={<OrderManagement />} />
          <Route path="clientes" element={<ClientManagement />} />
          <Route path="facturas" element={<InvoiceManagement />} />
          <Route path="proveedores" element={<SupplierManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;