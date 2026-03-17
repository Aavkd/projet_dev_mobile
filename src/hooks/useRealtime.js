import { useEffect } from 'react';
import { client } from '../lib/appwrite';

/**
 * Generic hook to subscribe to an Appwrite database collection.
 * @param {string} databaseId 
 * @param {string} collectionId 
 * @param {function} callback - Receives the Appwrite realtime response
 */
export function useRealtime(databaseId, collectionId, callback) {
  useEffect(() => {
    if (!databaseId || !collectionId) return;

    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      callback(response);
    });

    return () => unsubscribe();
  }, [databaseId, collectionId, callback]);
}
