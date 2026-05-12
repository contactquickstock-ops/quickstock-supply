import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'

// Public
import LandingPage  from './pages/public/LandingPage'
import LoginPage    from './pages/public/Login'
import RegisterPage from './pages/public/Register'

// Admin
import AdminDashboard   from './pages/admin/Dashboard'
import AdminCustomers   from './pages/admin/Customers'
import AdminDrivers     from './pages/admin/Drivers'
import AdminProducts    from './pages/admin/Products'
import AdminOrders      from './pages/admin/Orders'
import AdminMemberships from './pages/admin/Memberships'
import AdminRewards     from './pages/admin/Rewards'

// Customer
import CustomerDashboard  from './pages/customer/Dashboard'
import CustomerCart       from './pages/customer/Cart'
import CustomerCheckout   from './pages/customer/Checkout'
import CustomerOrders     from './pages/customer/Orders'
import CustomerRewards    from './pages/customer/Rewards'
import CustomerMembership from './pages/customer/Membership'

// Driver
import DriverDashboard from './pages/driver/Dashboard'
import DriverProfile   from './pages/driver/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Admin ── */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/customers"   element={<ProtectedRoute allowedRoles={['superadmin']}><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/drivers"     element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDrivers /></ProtectedRoute>} />
        <Route path="/admin/products"    element={<ProtectedRoute allowedRoles={['superadmin']}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders"      element={<ProtectedRoute allowedRoles={['superadmin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/memberships" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminMemberships /></ProtectedRoute>} />
        <Route path="/admin/rewards"     element={<ProtectedRoute allowedRoles={['superadmin']}><AdminRewards /></ProtectedRoute>} />

        {/* ── Customer ── */}
        <Route path="/customer/dashboard"  element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/cart"       element={<ProtectedRoute allowedRoles={['customer']}><CustomerCart /></ProtectedRoute>} />
        <Route path="/customer/checkout"   element={<ProtectedRoute allowedRoles={['customer']}><CustomerCheckout /></ProtectedRoute>} />
        <Route path="/customer/orders"     element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />
        <Route path="/customer/rewards"    element={<ProtectedRoute allowedRoles={['customer']}><CustomerRewards /></ProtectedRoute>} />
        <Route path="/customer/membership" element={<ProtectedRoute allowedRoles={['customer']}><CustomerMembership /></ProtectedRoute>} />

        {/* ── Driver ── */}
        <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/profile"   element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}
