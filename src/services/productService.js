import { databases, storage } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_PRODUCTS = import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS;
const BUCKET_PRODUCTS = import.meta.env.VITE_APPWRITE_BUCKET_PRODUCTS;

export const productService = {
  async listProducts(filters = {}) {
    const queries = [];
    if (filters.merchantId) {
      queries.push(Query.equal('merchant_id', filters.merchantId));
    }
    if (filters.category) {
      queries.push(Query.equal('category', filters.category));
    }
    
    return databases.listDocuments(DB_ID, COLLECTION_PRODUCTS, queries);
  },
  
  async getProduct(id) {
    return databases.getDocument(DB_ID, COLLECTION_PRODUCTS, id);
  },

  async createProduct(data) {
    return databases.createDocument(DB_ID, COLLECTION_PRODUCTS, ID.unique(), data);
  },

  async updateProduct(id, data) {
    return databases.updateDocument(DB_ID, COLLECTION_PRODUCTS, id, data);
  },

  async deleteProduct(id) {
    return databases.deleteDocument(DB_ID, COLLECTION_PRODUCTS, id);
  },

  async uploadImage(file) {
    return storage.createFile(BUCKET_PRODUCTS, ID.unique(), file);
  },

  getImageUrl(imageId) {
    return storage.getFilePreview(BUCKET_PRODUCTS, imageId);
  },

  async updateStock(id, delta) {
    const product = await this.getProduct(id);
    const newStock = Math.max(0, product.stock + delta);
    return databases.updateDocument(DB_ID, COLLECTION_PRODUCTS, id, { stock: newStock });
  }
};
