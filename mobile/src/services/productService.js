import { ID, InputFile, Query } from 'appwrite'
import { databases, storage } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, BUCKETS, COLLECTIONS } from '../lib/env'

export const productService = {
  async listProducts(filters = {}) {
    const queries = [Query.limit(200)]

    if (filters.merchantId) {
      queries.push(Query.equal('merchant_id', filters.merchantId))
    }

    if (filters.category) {
      queries.push(Query.equal('category', filters.category))
    }

    if (typeof filters.available === 'boolean') {
      queries.push(Query.equal('available', filters.available))
    }

    if (filters.orderDescCreated) {
      queries.push(Query.orderDesc('$createdAt'))
    }

    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.products, queries)
  },

  async getProduct(id) {
    return databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.products, id)
  },

  async createProduct(data) {
    return databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.products, ID.unique(), data)
  },

  async updateProduct(id, data) {
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.products, id, data)
  },

  async deleteProduct(id) {
    return databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.products, id)
  },

  async uploadImage(uri, fileName = 'product.jpg', mimeType = 'image/jpeg') {
    const inputFile = InputFile.fromPath(uri, fileName, mimeType)
    return storage.createFile(BUCKETS.products, ID.unique(), inputFile)
  },

  getImageUrl(imageId) {
    if (!imageId) return null
    const result = storage.getFilePreview(BUCKETS.products, imageId)
    return String(result)
  },

  async updateStock(id, delta) {
    const product = await this.getProduct(id)
    const newStock = Math.max(0, (product.stock || 0) + delta)
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.products, id, { stock: newStock })
  }
}
