import { ID, Query } from 'appwrite'
import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export const scheduleService = {
  async getOpeningHours(merchantId) {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.openingHours, [
      Query.equal('merchant_id', merchantId),
      Query.orderAsc('day_of_week'),
      Query.limit(20)
    ])
    return res.documents
  },

  async upsertOpeningHour(merchantId, dayOfWeek, openTime, closeTime, isClosed) {
    const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.openingHours, [
      Query.equal('merchant_id', merchantId),
      Query.equal('day_of_week', dayOfWeek),
      Query.limit(1)
    ])

    if (existing.documents.length > 0) {
      return databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.openingHours, existing.documents[0].$id, {
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed
      })
    }

    return databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.openingHours, ID.unique(), {
      merchant_id: merchantId,
      day_of_week: dayOfWeek,
      open_time: openTime,
      close_time: closeTime,
      is_closed: isClosed
    })
  }
}
