import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Route guard that ensures the user is authenticated.
 * Optionally restricts access to a specific role.
 *
 * @param {{ children: React.ReactNode, role?: 'merchant'|'client' }} props
 */
export default function ProtectedRoute({ children, role }) {
  const { user, userDoc, loading } = useAuth()

  // Show nothing while auth state is being restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm animate-pulse">Chargement…</span>
      </div>
    )
  }

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role mismatch → redirect to the user's own root
  if (role && userDoc?.role !== role) {
    const fallback = userDoc?.role === 'merchant' ? '/merchant/dashboard' : '/client/catalog'
    return <Navigate to={fallback} replace />
  }

  return children
}
