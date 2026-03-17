import { useCallback, useEffect, useMemo, useState } from 'react'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'
import { useAuth } from '../contexts/AuthContext'
import { notificationService } from '../services/notificationService'
import { useRealtime } from './useRealtime'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const fetchNotifications = useCallback(async () => {
    if (!user?.$id) return
    const response = await notificationService.listNotifications(user.$id)
    setNotifications(response.documents)
  }, [user])

  useEffect(() => {
    fetchNotifications().catch(() => {})
  }, [fetchNotifications])

  useRealtime(
    APPWRITE_DATABASE_ID && COLLECTIONS.notifications
      ? `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.notifications}.documents`
      : null,
    useCallback(
      (response) => {
        if (response?.payload?.user_id === user?.$id) {
          fetchNotifications().catch(() => {})
        }
      },
      [fetchNotifications, user]
    )
  )

  async function markAsRead(id) {
    await notificationService.markAsRead(id)
    setNotifications((prev) =>
      prev.map((item) => (item.$id === id ? { ...item, read: true } : item))
    )
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    refreshNotifications: fetchNotifications
  }
}
