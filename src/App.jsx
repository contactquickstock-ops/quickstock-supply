import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'

// Public
import LandingPage   from './pages/public/LandingPage'
import LoginPage       from './pages/public/Login'
import RegisterPage    from './pages/public/Register'
import AuthCallback    from './pages/public/AuthCallback'
import ForgotPassword  from './pages/public/ForgotPassword'
import AboutPage     from './pages/public/AboutPage'
import ProductsPage  from './pages/public/ProductsPage'
import RewardsPage   from './pages/public/RewardsPage'
import ContactPage   from './pages/public/ContactPage'

// Admin
import AdminDashboard   from './pages/admin/Dashboard'
import AdminCustomers   from './pages/admin/Customers'
import AdminDrivers     from './pages/admin/Drivers'
import AdminProducts    from './pages/admin/Products'
import AdminOrders      from './pages/admin/Orders'
import AdminMemberships from './pages/admin/Memberships'
import AdminRewards     from './pages/admin/Rewards'
import AdminPosts       from './pages/admin/Posts'
import AdminFeed        from './pages/admin/Feed'

// Customer
import CustomerDashboard     from './pages/customer/Dashboard'
import CustomerCart          from './pages/customer/Cart'
import CustomerCheckout      from './pages/customer/Checkout'
import CustomerOrders        from './pages/customer/Orders'
import CustomerRewards       from './pages/customer/Rewards'
import CustomerMembership    from './pages/customer/Membership'
import CustomerProfile       from './pages/customer/CustomerProfile'
import CustomerService       from './pages/customer/CustomerService'

// Driver
import DriverDashboard from './pages/driver/Dashboard'
import DriverProfile   from './pages/driver/Profile'
import DriverHistory   from './pages/driver/History'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/about"         element={<AboutPage />} />
        <Route path="/products"      element={<ProductsPage />} />
        <Route path="/rewards"       element={<RewardsPage />} />
        <Route path="/contact"       element={<ContactPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback"  element={<AuthCallback />} />

        {/* ── Admin ── */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/customers"   element={<ProtectedRoute allowedRoles={['superadmin']}><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/drivers"     element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDrivers /></ProtectedRoute>} />
        <Route path="/admin/products"    element={<ProtectedRoute allowedRoles={['superadmin']}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders"      element={<ProtectedRoute allowedRoles={['superadmin']}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/memberships" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminMemberships /></ProtectedRoute>} />
        <Route path="/admin/rewards"     element={<ProtectedRoute allowedRoles={['superadmin']}><AdminRewards /></ProtectedRoute>} />
        <Route path="/admin/posts"       element={<ProtectedRoute allowedRoles={['superadmin']}><AdminPosts /></ProtectedRoute>} />
        <Route path="/admin/feed"        element={<ProtectedRoute allowedRoles={['superadmin']}><AdminFeed /></ProtectedRoute>} />

        {/* ── Customer ── */}
        <Route path="/customer/dashboard"  element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/cart"       element={<ProtectedRoute allowedRoles={['customer']}><CustomerCart /></ProtectedRoute>} />
        <Route path="/customer/checkout"   element={<ProtectedRoute allowedRoles={['customer']}><CustomerCheckout /></ProtectedRoute>} />
        <Route path="/customer/orders"     element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />
        <Route path="/customer/rewards"    element={<ProtectedRoute allowedRoles={['customer']}><CustomerRewards /></ProtectedRoute>} />
        <Route path="/customer/membership" element={<ProtectedRoute allowedRoles={['customer']}><CustomerMembership /></ProtectedRoute>} />
        <Route path="/customer/profile"    element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
        <Route path="/customer/service"    element={<ProtectedRoute allowedRoles={['customer']}><CustomerService /></ProtectedRoute>} />

        {/* ── Driver ── */}
        <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/history"   element={<ProtectedRoute allowedRoles={['driver']}><DriverHistory /></ProtectedRoute>} />
        <Route path="/driver/profile"   element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}
