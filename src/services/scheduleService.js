import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_OPENING_HOURS = import.meta.env.VITE_APPWRITE_COLLECTION_OPENING_HOURS;

export const scheduleService = {
  async getOpeningHours(merchantId) {
    const res = await databases.listDocuments(DB_ID, COLLECTION_OPENING_HOURS, [
      Query.equal('merchant_id', merchantId),
      Query.orderAsc('day_of_week') // Optional, but nice to have Monday -> Sunday
    ]);
    return res.documents;
  },

  async upsertOpeningHour(merchantId, dayOfWeek, openTime, closeTime, isClosed) {
    const existing = await databases.listDocuments(DB_ID, COLLECTION_OPENING_HOURS, [
      Query.equal('merchant_id', merchantId),
      Query.equal('day_of_week', dayOfWeek)
    ]);

    if (existing.documents.length > 0) {
      const id = existing.documents[0].$id;
      return databases.updateDocument(DB_ID, COLLECTION_OPENING_HOURS, id, {
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed
      });
    } else {
      return databases.createDocument(DB_ID, COLLECTION_OPENING_HOURS, ID.unique(), {
        merchant_id: merchantId,
        day_of_week: dayOfWeek,
        open_time: openTime,
        close_time: closeTime,
        is_closed: isClosed
      });
    }
  }
};
