import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_NOTIFICATIONS = import.meta.env.VITE_APPWRITE_COLLECTION_NOTIFICATIONS;

export const notificationService = {
  async createNotification(userId, type, message, refs = {}) {
    return databases.createDocument(DB_ID, COLLECTION_NOTIFICATIONS, ID.unique(), {
      user_id: userId,
      type: type,
      message: message,
      read: false,
      order_id: refs.order_id || null,
      product_id: refs.product_id || null
    });
  },

  async listNotifications(userId) {
    return databases.listDocuments(DB_ID, COLLECTION_NOTIFICATIONS, [
      Query.equal('user_id', userId),
      Query.orderDesc('$createdAt')
    ]);
  },

  async markAsRead(id) {
    return databases.updateDocument(DB_ID, COLLECTION_NOTIFICATIONS, id, { read: true });
  }
};
