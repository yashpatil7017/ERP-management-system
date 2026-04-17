import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Protected Pages
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ProductList from './pages/Products/ProductList.jsx';
import AddProduct from './pages/Products/AddProduct.jsx';
import EditProduct from './pages/Products/EditProduct.jsx';
import CustomerList from './pages/Customers/CustomerList.jsx';
import AddCustomer from './pages/Customers/AddCustomer.jsx';
import EditCustomer from './pages/Customers/EditCustomer.jsx';
import SupplierList from './pages/Suppliers/SupplierList.jsx';
import AddSupplier from './pages/Suppliers/AddSupplier.jsx';
import EditSupplier from './pages/Suppliers/EditSupplier.jsx';
import SalesOrderList from './pages/SalesOrders/SalesOrderList.jsx';
import CreateSalesOrder from './pages/SalesOrders/CreateSalesOrder.jsx';
import CreatePurchaseOrder from './pages/PurchaseOrders/CreatePurchaseOrder.jsx';
import PurchaseOrderList from './pages/PurchaseOrders/PurchaseOrderList.jsx';
import CreateGRN from './pages/GRN/CreateGRN.jsx';
import GRNList from './pages/GRN/GRNList.jsx';
import InvoiceList from './pages/InvoiceList.jsx';
import GenerateInvoice from './pages/GenerateInvoice.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* PROTECTED ROUTES WITH LAYOUT */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard - All authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Products - Admin & Inventory */}
              <Route
                path="/products"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'inventory']}>
                    <ProductList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/products/new"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'inventory']}>
                    <AddProduct />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/products/:id/edit"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'inventory']}>
                    <EditProduct />
                  </RoleProtectedRoute>
                )}
              />

              {/* Customers - Admin & Sales */}
              <Route
                path="/customers"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <CustomerList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/customers/new"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <AddCustomer />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/customers/edit/:id"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <EditCustomer />
                  </RoleProtectedRoute>
                )}
              />

              {/* Suppliers - Admin & Purchase */}
              <Route
                path="/suppliers"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'purchase']}>
                    <SupplierList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/suppliers/new"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'purchase']}>
                    <AddSupplier />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/suppliers/edit/:id"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'purchase']}>
                    <EditSupplier />
                  </RoleProtectedRoute>
                )}
              />

              {/* Sales Orders - Admin & Sales */}
              <Route
                path="/sales-orders"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <SalesOrderList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/sales-orders/create"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <CreateSalesOrder />
                  </RoleProtectedRoute>
                )}
              />

              {/* Purchase Orders - Admin & Purchase */}
              <Route
                path="/purchase-orders"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'purchase']}>
                    <PurchaseOrderList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/purchase-orders/new"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'purchase']}>
                    <CreatePurchaseOrder />
                  </RoleProtectedRoute>
                )}
              />

              {/* GRN - Admin, Inventory, Purchase */}
              <Route
                path="/grn"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'inventory', 'purchase']}>
                    <GRNList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/grn/create"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'inventory', 'purchase']}>
                    <CreateGRN />
                  </RoleProtectedRoute>
                )}
              />

              {/* Invoices - Admin & Sales */}
              <Route
                path="/invoices"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <InvoiceList />
                  </RoleProtectedRoute>
                )}
              />
              <Route
                path="/invoices/generate"
                element={(
                  <RoleProtectedRoute allowedRoles={['admin', 'sales']}>
                    <GenerateInvoice />
                  </RoleProtectedRoute>
                )}
              />

              {/* Admin - Admin only */}
              <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* ROOT AND FALLBACK */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
