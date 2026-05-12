<>
  <Route path='/admin/dashboard' element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } />
  <Route path='/admin/drivers' element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <Drivers />
    </ProtectedRoute>
  } />
  <Route path='/admin/products' element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <Products />
    </ProtectedRoute>
  } />
  <Route path='/admin/memberships' element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <Memberships />
    </ProtectedRoute>
  } />
  <Route path='/admin/rewards' element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <Rewards />
    </ProtectedRoute>
  } />
  <Route path='/customer/dashboard' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <CustomerDashboard />
    </ProtectedRoute>
  } />
  <Route path='/customer/cart' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <Cart />
    </ProtectedRoute>
  } />
  <Route path='/customer/checkout' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <Checkout />
    </ProtectedRoute>
  } />
  <Route path='/customer/orders' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <Orders />
    </ProtectedRoute>
  } />
  <Route path='/customer/membership' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <Membership />
    </ProtectedRoute>
  } />
  <Route path='/customer/rewards' element={
    <ProtectedRoute allowedRoles={['customer']}>
      <CustomerRewards />
    </ProtectedRoute>
  } />
  <Route path='/driver/dashboard' element={
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverDashboard />
    </ProtectedRoute>
  } />
  <Route path='/driver/profile' element={
    <ProtectedRoute allowedRoles={['driver']}>
      <DriverProfile />
    </ProtectedRoute>
  } />
</>
