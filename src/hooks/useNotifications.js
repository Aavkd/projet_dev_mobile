import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from './useRealtime';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_NOTIFICATIONS = import.meta.env.VITE_APPWRITE_COLLECTION_NOTIFICATIONS;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const resp = await notificationService.listNotifications(user.$id);
      setNotifications(resp.documents);
      setUnreadCount(resp.documents.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtime(DB_ID, COLLECTION_NOTIFICATIONS, (response) => {
    if (response.payload.user_id === user?.$id) {
      fetchNotifications();
    }
  });

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.$id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return { notifications, unreadCount, markAsRead };
}
