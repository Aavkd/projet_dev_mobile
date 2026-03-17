import { databases } from '../lib/appwrite'
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '../lib/env'

export async function createUserDoc(userId, email, name, role) {
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    COLLECTIONS.users,
    userId,
    {
      email,
      name,
      role
    }
  )
}

export async function getUserDoc(userId) {
  return databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.users, userId)
}
