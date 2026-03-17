import { Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export const statsService = {
  async getMerchantStats(merchantId) {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.orders, [
      Query.equal('merchant_id', merchantId),
      Query.limit(1000)
    ])

    const docs = res.documents
    const totalOrders = docs.length
    let revenue = 0

    const ordersByStatus = {
      pending: 0,
      ready: 0,
      done: 0,
      cancelled: 0
    }

    for (const order of docs) {
      const status = order.status || 'pending'
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1
      if (status !== 'cancelled') {
        revenue += order.total || 0
      }
    }

    return {
      totalOrders,
      revenue,
      ordersByStatus,
      topProducts: []
    }
  }
}
