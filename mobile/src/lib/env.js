export const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT
export const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
export const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID

export const COLLECTIONS = {
  users: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_USERS,
  products: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_PRODUCTS,
  categories: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_CATEGORIES,
  orders: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ORDERS,
  orderItems: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ORDER_ITEMS,
  pickupAddresses: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_PICKUP_ADDRESSES,
  openingHours: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_OPENING_HOURS,
  notifications: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS
}

export const BUCKETS = {
  products: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_PRODUCTS
}

export function validateEnv() {
  const required = {
    EXPO_PUBLIC_APPWRITE_ENDPOINT: APPWRITE_ENDPOINT,
    EXPO_PUBLIC_APPWRITE_PROJECT_ID: APPWRITE_PROJECT_ID,
    EXPO_PUBLIC_APPWRITE_DATABASE_ID: APPWRITE_DATABASE_ID,
    EXPO_PUBLIC_APPWRITE_COLLECTION_USERS: COLLECTIONS.users
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    valid: missing.length === 0,
    missing
  }
}
