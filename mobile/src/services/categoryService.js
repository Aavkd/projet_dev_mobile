import { ID, Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export const categoryService = {
  async listCategories(merchantId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.categories, [
      Query.equal('merchant_id', merchantId),
      Query.orderAsc('name'),
      Query.limit(200)
    ])
  },

  async createCategory(data) {
    return databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.categories, ID.unique(), data)
  },

  async updateCategory(id, data) {
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.categories, id, data)
  },

  async deleteCategory(id) {
    return databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.categories, id)
  }
}
