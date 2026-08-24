import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClientLayout } from '@/layouts/ClientLayout';
import { Home } from '@/pages/Home';
import { Catalog } from '@/pages/Catalog';
import { ProductDetail } from '@/pages/ProductDetail';
import { Checkout } from '@/pages/Checkout';
import { Services } from '@/pages/Services';
import { Booking } from '@/pages/Booking';
import { Tracking } from '@/pages/Tracking';

// Admin imports
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AdminLogin } from '@/pages/admin/Login';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Products } from '@/pages/admin/Products';
import { Inventory } from '@/pages/admin/Inventory';
import { Parts } from '@/pages/admin/Parts';
import { Customers } from '@/pages/admin/Customers';
import { Technicians } from '@/pages/admin/Technicians';
import { Appointments } from '@/pages/admin/Appointments';
import { WorkOrders } from '@/pages/admin/WorkOrders';
import { WorkOrderDetail } from '@/pages/admin/WorkOrderDetail';
import { Warranties } from '@/pages/admin/Warranties';
import { Reports } from '@/pages/admin/Reports';
import { Audit } from '@/pages/admin/Audit';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas (Portal Cliente) */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="productos" element={<Catalog />} />
          <Route path="productos/:id" element={<ProductDetail />} />
          <Route path="carrito" element={<Checkout />} />
          <Route path="servicios" element={<Services />} />
          <Route path="agendar" element={<Booking />} />
          <Route path="seguimiento" element={<Tracking />} />
        </Route>

        {/* Rutas Administrativas (Admin Panel) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="productos" element={<Products />} />
          <Route path="inventario" element={<Inventory />} />
          <Route path="repuestos" element={<Parts />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="tecnicos" element={<Technicians />} />
          <Route path="citas" element={<Appointments />} />
          <Route path="ordenes" element={<WorkOrders />} />
          <Route path="ordenes/:id" element={<WorkOrderDetail />} />
          <Route path="garantias" element={<Warranties />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="auditoria" element={<Audit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
