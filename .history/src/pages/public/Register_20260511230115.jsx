const { data, error } = await supabase.auth.signUp({
  email,
  password,
})


if (data.user) {
  await supabase.from('profiles').insert({
    id: data.user.id,
    fullname,
    email,
    contact_number,
    address,
    role: 'customer',
    status: 'pending'
  })
}
