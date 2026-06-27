"use client";

const DB_NAME = "opticare-fs-handles";
const DB_VERSION = 1;
const STORE_NAME = "directory-handles";

export type FolderHandleKey = "local" | "pendrive";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveDirectoryHandle(
  key: FolderHandleKey,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(handle, key);
  });
  db.close();
}

export async function loadDirectoryHandle(
  key: FolderHandleKey,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb();
    const handle = await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () =>
        resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return handle;
  } catch {
    return null;
  }
}

export async function clearDirectoryHandle(key: FolderHandleKey): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).delete(key);
  });
  db.close();
}

export async function ensureWritePermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const opts = { mode: "readwrite" as const };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  return (await handle.requestPermission(opts)) === "granted";
}
