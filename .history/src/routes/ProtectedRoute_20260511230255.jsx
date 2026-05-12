import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile } = useAuth()


  if (!user) return <Navigate to='/login' />
  if (!allowedRoles.includes(profile?.role)) return <Navigate to='/login' />
  if (profile?.status !== 'approved') return <Navigate to='/login' />


  return children
}
