import { saveBlobOffline } from './idb';

const BACKOFF_DELAYS = [2000, 4000, 8000, 16000, 32000];
let isSyncing = false;

function dispatchQueueUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('offline-queue-update'));
  }
}

export async function apiPost(url, body, isFormData = false) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? body : JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status >= 500) throw new TypeError('Network response was not ok (500)');
        return response.json(); 
      }
      return response.json();
    } catch (error) {
      if (!(error instanceof TypeError)) throw error; 
    }
  }

  // Queue Offline
  const queueId = crypto.randomUUID();
  let payloadSaver = body;

  if (isFormData) {
    const imageBlob = body.get('image');
    const sessionId = body.get('session_id');
    if (imageBlob) {
      await saveBlobOffline(queueId, imageBlob, { url, session_id: sessionId });
      payloadSaver = { idbKey: queueId, session_id: sessionId };
    }
  }

  const existingQueue = JSON.parse(localStorage.getItem('api_queue') || '[]');
  existingQueue.push({ id: queueId, url, bodyData: payloadSaver, timestamp: Date.now(), retries: 0 });
  localStorage.setItem('api_queue', JSON.stringify(existingQueue));
  dispatchQueueUpdate();

  return { success: true, queued: true, id: queueId };
}

export async function syncOfflineQueue() {
  if (!navigator.onLine || isSyncing) return;
  isSyncing = true;

  try {
    let queue = JSON.parse(localStorage.getItem('api_queue') || '[]');
    let updatedQueue = [...queue];

    for (const item of queue) {
      try {
        let fetchBody = item.bodyData;
        let isFormData = false;

        if (item.bodyData?.idbKey) {
          const fd = new FormData();
          fd.append('session_id', item.bodyData.session_id);
          fd.append('image', new Blob(['restored'], {type: 'image/jpeg'})); // Mocked for now
          fetchBody = fd;
          isFormData = true;
        } else {
          fetchBody = JSON.stringify(item.bodyData);
        }

        const response = await fetch(item.url, {
          method: 'POST',
          headers: isFormData ? {} : { 'Content-Type': 'application/json' },
          body: fetchBody
        });

        if (response.ok || (response.status >= 400 && response.status < 500)) {
          updatedQueue = updatedQueue.filter(q => q.id !== item.id);
        } else {
          throw new Error('5xx');
        }
      } catch (err) {
        item.retries++;
        if (item.retries >= BACKOFF_DELAYS.length) updatedQueue = updatedQueue.filter(q => q.id !== item.id);
      }
    }

    localStorage.setItem('api_queue', JSON.stringify(updatedQueue));
    dispatchQueueUpdate();
  } finally {
    isSyncing = false;
  }
}
