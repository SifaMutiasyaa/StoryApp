// utils/idb.js
import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

// Fungsi untuk generate fallback image base64
const generateNoImageFallback = () => 
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjODg4Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const IDBHelper = {
  async saveStories(stories) {
    const enrichedStories = await Promise.all(
      stories.map(async (story) => {
        let base64Image = generateNoImageFallback();
        
        if (story.photoUrl) {
          try {
            const response = await fetch(story.photoUrl);
            const blob = await response.blob();
            base64Image = await this.convertBlobToBase64(blob);
          } catch (err) {
            console.warn('Gagal mengambil gambar:', err);
          }
        }

        return {
          ...story,
          offlineImage: base64Image,
          lat: story.lat,
          lon: story.lon,
          createdAt: story.createdAt || new Date().toISOString()
        };
      })
    );

    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const story of enrichedStories) {
      await store.put(story);
    }

    await tx.done;
  },

  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },

  async deleteStory(id) {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
};

export default IDBHelper;