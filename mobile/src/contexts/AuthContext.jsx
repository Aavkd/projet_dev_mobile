import { ID } from 'appwrite'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { account } from '../lib/appwrite'
import { createUserDoc, getUserDoc } from '../services/userService'

const SESSION_KEY = 'cc-mobile-session'
const AuthContext = createContext(null)

function isActiveSessionError(error) {
  const message = String(error?.message || '').toLowerCase()
  return message.includes('session is active') || message.includes('creation of a session is prohibited')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      try {
        await SecureStore.getItemAsync(SESSION_KEY)
        const session = await account.get()
        const doc = await getUserDoc(session.$id)
        if (isMounted) {
          setUser(session)
          setUserDoc(doc)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setUserDoc(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  async function clearCurrentSession() {
    try {
      await account.deleteSession('current')
    } catch {
      // Ignore: there is simply no active session to delete.
    }
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {})
  }

  async function clearAllSessionsFallback() {
    // In some mobile runtimes Appwrite may still report an active session after deleteSession('current').
    // This fallback attempts to enumerate and remove all sessions for the authenticated user.
    try {
      await account.get()
      const sessions = await account.listSessions()
      for (const session of sessions.sessions || sessions.documents || []) {
        await account.deleteSession(session.$id).catch(() => {})
      }
    } catch {
      // No valid auth context for listing sessions; nothing else to do here.
    }

    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {})
  }

  async function refreshAuthState() {
    const session = await account.get()
    const doc = await getUserDoc(session.$id)
    await SecureStore.setItemAsync(SESSION_KEY, session.$id)
    setUser(session)
    setUserDoc(doc)
    return doc
  }

  async function login(email, password) {
    await clearCurrentSession()

    try {
      await account.createEmailPasswordSession(email, password)
      return refreshAuthState()
    } catch (error) {
      if (!isActiveSessionError(error)) {
        throw error
      }

      await clearAllSessionsFallback()
      await new Promise((resolve) => setTimeout(resolve, 250))
      await account.createEmailPasswordSession(email, password)
      return refreshAuthState()
    }
  }

  async function register(name, email, password, role) {
    await clearCurrentSession()
    const created = await account.create(ID.unique(), email, password, name)
    await account.createEmailPasswordSession(email, password)
    const doc = await createUserDoc(created.$id, email, name, role)

    const session = await account.get()
    await SecureStore.setItemAsync(SESSION_KEY, session.$id)
    setUser(session)
    setUserDoc(doc)
    return doc
  }

  async function logout() {
    await clearCurrentSession()
    setUser(null)
    setUserDoc(null)
  }

  async function switchAccount() {
    await logout()
  }

  const value = useMemo(
    () => ({ user, userDoc, loading, login, register, logout, switchAccount, refreshAuthState }),
    [user, userDoc, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
