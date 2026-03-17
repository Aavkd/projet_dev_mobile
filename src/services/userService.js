import { databases } from '../lib/appwrite'

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS

/**
 * Create a user document in the `users` collection.
 * @param {string} userId - Appwrite account $id
 * @param {string} email
 * @param {string} name
 * @param {'merchant'|'client'} role
 * @returns {Promise<import('appwrite').Models.Document>}
 */
export async function createUserDoc(userId, email, name, role) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    userId,
    {
      email,
      name,
      role,
    },
  )
}

/**
 * Fetch a user document by account ID.
 * @param {string} userId
 * @returns {Promise<import('appwrite').Models.Document>}
 */
export async function getUserDoc(userId) {
  return databases.getDocument(DATABASE_ID, COLLECTION_ID, userId)
}
