import { useEffect } from 'react'
import { client } from '../lib/appwrite'

export function useRealtime(channel, callback) {
  useEffect(() => {
    if (!channel || typeof callback !== 'function') return

    const unsubscribe = client.subscribe(channel, callback)
    return () => unsubscribe()
  }, [channel, callback])
}
