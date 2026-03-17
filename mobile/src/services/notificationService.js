import { ID, Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export const notificationService = {
  async createNotification(userId, type, message, refs = {}) {
    return databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.notifications, ID.unique(), {
      user_id: userId,
      type,
      message,
      read: false,
      order_id: refs.order_id || null,
      product_id: refs.product_id || null
    })
  },

  async listNotifications(userId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.notifications, [
      Query.equal('user_id', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(100)
    ])
  },

  async markAsRead(id) {
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.notifications, id, { read: true })
  }
}
