const { data, error } = await supabase.auth.signInWithPassword({ email, password })


const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', data.user.id)
  .single()


if (profile.status === 'pending') {
  toast.error('Your account is awaiting admin approval.')
  await supabase.auth.signOut()
  return
}


// Redirect based on role
if (profile.role === 'superadmin') navigate('/admin/dashboard')
if (profile.role === 'customer')   navigate('/customer/dashboard')
if (profile.role === 'driver')     navigate('/driver/dashboard')
