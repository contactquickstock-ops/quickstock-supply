<Route path='/admin/dashboard' element={
  <ProtectedRoute allowedRoles={['superadmin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
