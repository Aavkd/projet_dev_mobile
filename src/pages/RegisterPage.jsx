import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLES = [
  { value: 'client', label: 'Client — Je commande' },
  { value: 'merchant', label: 'Commerçant — Je vends' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      const doc = await register(name, email, password, role)
      if (doc.role === 'merchant') {
        navigate('/merchant/dashboard')
      } else {
        navigate('/client/catalog')
      }
    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="app-card space-y-6 p-8">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Creer un compte</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-gray-400">Rejoignez Click &amp; Collect</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-gray-300 mb-1">
                Nom complet
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className="ui-input"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-gray-300 mb-1">
                Adresse e-mail
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="ui-input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="ui-input"
              />
            </div>

            {/* Role selector */}
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-gray-300 mb-2">Je suis…</span>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    htmlFor={`role-${r.value}`}
                    className={`flex items-center justify-center cursor-pointer rounded-lg border-2 px-3 py-3 text-sm font-medium transition-base ${
                      role === r.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <input
                      id={`role-${r.value}`}
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="sr-only"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-submit"
              className="btn-primary w-full py-3 text-sm"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
