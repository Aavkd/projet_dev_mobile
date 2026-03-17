import { createContext, useContext, useEffect, useState } from 'react'
import { account } from '../lib/appwrite'
import { createUserDoc, getUserDoc } from '../services/userService'
import { ID } from 'appwrite'

const AuthContext = createContext(null)

/**
 * Provides `user` (Appwrite Auth account), `userDoc` (users collection document),
 * `login()`, `register()`, and `logout()`.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    account
      .get()
      .then(async (session) => {
        try {
          const doc = await getUserDoc(session.$id)
          setUser(session)
          setUserDoc(doc)
        } catch (error) {
          // If the document doesn't exist (404), clear the orphaned session
          await account.deleteSession('current').catch(() => {})
          setUser(null)
          setUserDoc(null)
        }
      })
      .catch(() => {
        setUser(null)
        setUserDoc(null)
      })
      .finally(() => setLoading(false))
  }, [])

  /**
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    await account.createEmailPasswordSession(email, password)
    const session = await account.get()
    const doc = await getUserDoc(session.$id)
    setUser(session)
    setUserDoc(doc)
    return doc
  }

  /**
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {'merchant'|'client'} role
   */
  async function register(name, email, password, role) {
    const created = await account.create(ID.unique(), email, password, name)
    await account.createEmailPasswordSession(email, password)
    const doc = await createUserDoc(created.$id, email, name, role)
    const session = await account.get()
    setUser(session)
    setUserDoc(doc)
    return doc
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
    setUserDoc(null)
  }

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** @returns {{ user: import('appwrite').Models.User<Record<string,unknown>>, userDoc: import('appwrite').Models.Document|null, loading: boolean, login: Function, register: Function, logout: Function }} */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
