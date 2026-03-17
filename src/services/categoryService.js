import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_CATEGORIES = import.meta.env.VITE_APPWRITE_COLLECTION_CATEGORIES;

export const categoryService = {
  async listCategories(merchantId) {
    return databases.listDocuments(DB_ID, COLLECTION_CATEGORIES, [
      Query.equal('merchant_id', merchantId)
    ]);
  },

  async createCategory(data) {
    return databases.createDocument(DB_ID, COLLECTION_CATEGORIES, ID.unique(), data);
  },

  async updateCategory(id, data) {
    return databases.updateDocument(DB_ID, COLLECTION_CATEGORIES, id, data);
  },

  async deleteCategory(id) {
    return databases.deleteDocument(DB_ID, COLLECTION_CATEGORIES, id);
  }
};
