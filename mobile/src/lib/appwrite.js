import { Account, Client, Databases, Storage } from 'appwrite'
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './env'

// Appwrite Web SDK expects window.localStorage for cookie fallback headers.
// Expo React Native has no browser localStorage, so we provide a tiny in-memory shim.
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis
}

if (!globalThis.window.localStorage) {
  const memoryStore = new Map()
  globalThis.window.localStorage = {
    getItem(key) {
      return memoryStore.has(key) ? memoryStore.get(key) : null
    },
    setItem(key, value) {
      memoryStore.set(key, String(value))
    },
    removeItem(key) {
      memoryStore.delete(key)
    },
    clear() {
      memoryStore.clear()
    }
  }
}

const client = new Client()

client
  .setEndpoint(APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1')
  .setProject(APPWRITE_PROJECT_ID ?? '')

const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

export { client, account, databases, storage }
