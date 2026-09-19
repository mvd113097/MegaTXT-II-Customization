/**
 * High-performance, quota-free IndexedDB storage for MegaText translator.
 * Solves the ~5MB browser LocalStorage limit for massive 1,000,000+ character novels,
 * caches reader chapters offline for maximum data saving, and stores settings.
 */

const DB_NAME = "megatext_idb_v1";
const DB_VERSION = 1;

const STORES = {
  SESSIONS: "sessions",
  CACHED_CHAPTERS: "cached_chapters",
  READER_SETTINGS: "reader_settings",
  GLOSSARY: "glossary_cache",
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        db.createObjectStore(STORES.SESSIONS);
      }
      if (!db.objectStoreNames.contains(STORES.CACHED_CHAPTERS)) {
        // key format: `${novelId}__ch_${chapterIndex}`
        db.createObjectStore(STORES.CACHED_CHAPTERS);
      }
      if (!db.objectStoreNames.contains(STORES.READER_SETTINGS)) {
        db.createObjectStore(STORES.READER_SETTINGS);
      }
      if (!db.objectStoreNames.contains(STORES.GLOSSARY)) {
        db.createObjectStore(STORES.GLOSSARY);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Get an item from a specific IndexedDB store
 */
export async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) ?? null);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Failed to get ${key} from ${storeName}:`, err);
    return null;
  }
}

/**
 * Save an item to a specific IndexedDB store
 */
export async function idbSet<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);

      req.onsuccess = () => {
        resolve();
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Failed to set ${key} in ${storeName}:`, err);
  }
}

/**
 * Delete an item from a specific IndexedDB store
 */
export async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Failed to delete ${key} from ${storeName}:`, err);
  }
}

// ----------------------------------------------------
// Specialized Session Storage Helpers
// ----------------------------------------------------

const ACTIVE_SESSION_KEY = "current_active_session";

export async function saveSessionToIdb(session: any): Promise<void> {
  await idbSet(STORES.SESSIONS, ACTIVE_SESSION_KEY, session);
}

export async function getSessionFromIdb(): Promise<any | null> {
  return await idbGet(STORES.SESSIONS, ACTIVE_SESSION_KEY);
}

export async function clearSessionFromIdb(): Promise<void> {
  await idbDelete(STORES.SESSIONS, ACTIVE_SESSION_KEY);
}

// ----------------------------------------------------
// Specialized Chapter Offline Cache (Data Saver)
// ----------------------------------------------------

export interface CachedChapterData {
  chapterIndex: number;
  chapterTitle: string;
  chineseContent: string;
  englishContent?: string;
  totalChapters?: number;
  timestamp: number;
}

export async function getCachedChapter(novelId: string, chapterIndex: number): Promise<CachedChapterData | null> {
  const key = `${novelId}__ch_${chapterIndex}`;
  return await idbGet<CachedChapterData>(STORES.CACHED_CHAPTERS, key);
}

export async function setCachedChapter(
  novelId: string,
  chapterIndex: number,
  data: Omit<CachedChapterData, "timestamp">
): Promise<void> {
  const key = `${novelId}__ch_${chapterIndex}`;
  await idbSet<CachedChapterData>(STORES.CACHED_CHAPTERS, key, {
    ...data,
    timestamp: Date.now(),
  });
}

// ----------------------------------------------------
// Reader Settings Persistence
// ----------------------------------------------------

export interface ReaderPreferences {
  theme: "sepia" | "oled" | "cream" | "slate" | "light";
  fontSize: number;
  lineHeight: "compact" | "normal" | "relaxed";
  fontFamily: "serif" | "sans" | "mono";
  bilingualMode: "english" | "dual" | "chinese";
  ttsEngine?: "google-classic" | "browser-native";
  ttsVoiceName?: string;
  cloudVoiceLang?: string;
  ttsRate: number;
  ttsPitch: number;
  autoAdvanceTts: boolean;
}

const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: "sepia",
  fontSize: 17,
  lineHeight: "normal",
  fontFamily: "serif",
  bilingualMode: "english",
  ttsEngine: "browser-native",
  cloudVoiceLang: "en",
  ttsRate: 1.0,
  ttsPitch: 1.0,
  autoAdvanceTts: true,
};

export async function getReaderPreferences(): Promise<ReaderPreferences> {
  const prefs = await idbGet<ReaderPreferences>(STORES.READER_SETTINGS, "preferences");
  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window && !!window.speechSynthesis;
  const defaultEngine: "browser-native" | "google-classic" = hasSpeechSynthesis ? "browser-native" : "google-classic";
  
  const resolvedPrefs: ReaderPreferences = { ...DEFAULT_READER_PREFERENCES, ttsEngine: defaultEngine, ...(prefs || {}) };
  // If user previously had browser-native saved but is now in a browser without SpeechSynthesis (e.g. Soul Browser), auto fallback to google-classic
  if (!hasSpeechSynthesis && resolvedPrefs.ttsEngine === "browser-native") {
    resolvedPrefs.ttsEngine = "google-classic";
  }
  return resolvedPrefs;
}

export async function saveReaderPreferences(prefs: Partial<ReaderPreferences>): Promise<void> {
  const current = await getReaderPreferences();
  await idbSet(STORES.READER_SETTINGS, "preferences", { ...current, ...prefs });
}

// ----------------------------------------------------
// User Library Persistence (with instant localStorage sync)
// ----------------------------------------------------

const LIBRARY_STORAGE_KEY = "megatext_user_library_v1";

export function getLocalLibraryBooks(): any[] {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLibraryBooks(books: any[]): void {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn("Failed to persist library books to localStorage:", err);
  }
}

export function addOrUpdateBookInLibrary(book: any): any[] {
  const list = getLocalLibraryBooks();
  const novelId = book.id || `${book.siteId || "src"}_${book.title}`;
  const existingIdx = list.findIndex((b) => b.id === novelId || (b.title === book.title && b.author === book.author));
  
  const updatedBook = {
    ...book,
    id: novelId,
    lastReadAt: Date.now(),
    addedAt: existingIdx >= 0 ? list[existingIdx].addedAt : Date.now(),
    currentChapterIndex: book.currentChapterIndex || (existingIdx >= 0 ? list[existingIdx].currentChapterIndex : 1),
    totalChapters: book.totalChapters || (existingIdx >= 0 ? list[existingIdx].totalChapters : 1),
  };

  let nextList: any[];
  if (existingIdx >= 0) {
    nextList = [...list];
    nextList[existingIdx] = { ...list[existingIdx], ...updatedBook };
  } else {
    nextList = [updatedBook, ...list];
  }

  saveLocalLibraryBooks(nextList);
  return nextList;
}

export function removeBookFromLibrary(bookId: string): any[] {
  const list = getLocalLibraryBooks();
  const nextList = list.filter((b) => b.id !== bookId);
  saveLocalLibraryBooks(nextList);
  return nextList;
}
