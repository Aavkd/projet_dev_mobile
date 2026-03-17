import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ORDERS = import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS;

export const statsService = {
  async getMerchantStats(merchantId) {
    const res = await databases.listDocuments(DB_ID, COLLECTION_ORDERS, [
      Query.equal('merchant_id', merchantId),
      Query.limit(1000)
    ]);
    
    const docs = res.documents;
    const totalOrders = docs.length;
    
    let revenue = 0;
    const ordersByStatus = {
      pending: 0,
      ready: 0,
      done: 0,
      cancelled: 0
    };

    for (const order of docs) {
      if (order.status !== 'cancelled') {
        revenue += (order.total || 0);
      }
      
      const status = order.status || 'pending';
      if (ordersByStatus[status] !== undefined) {
        ordersByStatus[status]++;
      } else {
        ordersByStatus[status] = 1;
      }
    }

    return {
      totalOrders,
      revenue,
      ordersByStatus,
      topProducts: [] 
    };
  }
};
