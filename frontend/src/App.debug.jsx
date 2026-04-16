import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Protected Pages
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProductList from './pages/Products/ProductList.jsx';
import CustomerList from './pages/Customers/CustomerList.jsx';
import SupplierList from './pages/Suppliers/SupplierList.jsx';
import SalesOrderList from './pages/SalesOrders/SalesOrderList.jsx';
import PurchaseOrderList from './pages/PurchaseOrders/PurchaseOrderList.jsx';
import GRNList from './pages/GRN/GRNList.jsx';
import InvoiceList from './pages/Invoices/InvoiceList.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';

function AppDebug() {
  console.log('🚀 App component rendering');
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'sales']} />}>
            <Route path="/products" element={<ProductList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'sales']} />}>
            <Route path="/customers" element={<CustomerList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'purchase']} />}>
            <Route path="/suppliers" element={<SupplierList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'sales']} />}>
            <Route path="/sales-orders" element={<SalesOrderList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'purchase']} />}>
            <Route path="/purchase-orders" element={<PurchaseOrderList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin', 'inventory']} />}>
            <Route path="/grn" element={<GRNList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
            <Route path="/invoices" element={<InvoiceList />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* ROOT AND FALLBACK */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppDebug;
