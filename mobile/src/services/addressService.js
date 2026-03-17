import { ID, Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export const addressService = {
  async listAddresses(clientId) {
    return databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.pickupAddresses, [
      Query.equal('client_id', clientId),
      Query.orderDesc('is_default'),
      Query.orderAsc('$createdAt'),
      Query.limit(200)
    ])
  },

  async createAddress(data) {
    if (data.is_default && data.client_id) {
      await this.clearDefault(data.client_id)
    }
    return databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.pickupAddresses, ID.unique(), data)
  },

  async updateAddress(id, data, clientId) {
    if (data.is_default && clientId) {
      await this.clearDefault(clientId)
      data.is_default = true
    }
    return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.pickupAddresses, id, data)
  },

  async deleteAddress(id) {
    return databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.pickupAddresses, id)
  },

  async setDefault(id, clientId) {
    await this.clearDefault(clientId)
    return this.updateAddress(id, { is_default: true }, clientId)
  },

  async clearDefault(clientId) {
    const addresses = await this.listAddresses(clientId)
    for (const addr of addresses.documents) {
      if (addr.is_default) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.pickupAddresses, addr.$id, {
          is_default: false
        })
      }
    }
  }
}
