import { openDB } from 'idb';

const DB_NAME = 'consentlens_offline';
const STORE_NAME = 'media_blobs';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveBlobOffline(key, blob, metadata) {
  const db = await getDB();
  return db.put(STORE_NAME, { blob, metadata, timestamp: Date.now() }, key);
}

export async function getBlobOffline(key) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}
