import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_PICKUP_ADDRESSES = import.meta.env.VITE_APPWRITE_COLLECTION_PICKUP_ADDRESSES;

export const addressService = {
  async listAddresses(clientId) {
    return databases.listDocuments(DB_ID, COLLECTION_PICKUP_ADDRESSES, [
      Query.equal('client_id', clientId)
    ]);
  },

  async createAddress(data) {
    if (data.is_default && data.client_id) {
      await this.clearDefault(data.client_id);
    }
    return databases.createDocument(DB_ID, COLLECTION_PICKUP_ADDRESSES, ID.unique(), data);
  },

  async updateAddress(id, data, clientId) {
    if (data.is_default && clientId) {
      await this.clearDefault(clientId);
      data.is_default = true;
    }
    return databases.updateDocument(DB_ID, COLLECTION_PICKUP_ADDRESSES, id, data);
  },

  async deleteAddress(id) {
    return databases.deleteDocument(DB_ID, COLLECTION_PICKUP_ADDRESSES, id);
  },

  async setDefault(id, clientId) {
    await this.clearDefault(clientId);
    return this.updateAddress(id, { is_default: true }, clientId);
  },

  async clearDefault(clientId) {
    const addresses = await this.listAddresses(clientId);
    for (const addr of addresses.documents) {
      if (addr.is_default) {
        await databases.updateDocument(DB_ID, COLLECTION_PICKUP_ADDRESSES, addr.$id, { is_default: false });
      }
    }
  }
};
