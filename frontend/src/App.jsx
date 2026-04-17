import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute';
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
import InvoiceList from './pages/Invoices/InvoiceList.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
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

              {/* Products - Admin & Sales */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<AddProduct />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />

              {/* Customers - Admin & Sales */}
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/edit/:id" element={<EditCustomer />} />

              {/* Suppliers - Admin & Purchase */}
              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/suppliers/new" element={<AddSupplier />} />
              <Route path="/suppliers/edit/:id" element={<EditSupplier />} />

              {/* Sales Orders - Admin & Sales */}
              <Route path="/sales-orders" element={<SalesOrderList />} />
              <Route path="/sales-orders/create" element={<CreateSalesOrder />} />

              {/* Purchase Orders - Admin & Purchase */}
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/purchase-orders/new" element={<CreatePurchaseOrder />} />

              {/* GRN - Admin & Inventory */}
              <Route path="/grn" element={<GRNList />} />
              <Route path="/grn/create" element={<CreateGRN />} />

              {/* Invoices - Admin only */}
              <Route path="/invoices" element={<InvoiceList />} />

              {/* Admin - Admin only */}
              <Route path="/admin" element={<AdminDashboard />} />
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
