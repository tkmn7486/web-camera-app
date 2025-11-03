// IndexedDBを使った画像ストレージ管理

export interface SavedImage {
  id: string
  dataUrl: string
  timestamp: number
}

const DB_NAME = "web-camera-db"
const DB_VERSION = 1
const STORE_NAME = "images"

let db: IDBDatabase | null = null

// IndexedDBを初期化
export function initDB(): Promise<IDBDatabase> {
  if (db) {
    return Promise.resolve(db)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("IndexedDBの初期化に失敗しました"))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      
      // オブジェクトストアが存在しない場合は作成
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: "id" })
        objectStore.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

// 画像を保存
export async function saveImage(image: SavedImage): Promise<void> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(image)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("画像の保存に失敗しました"))
    }
  })
}

// 全画像を取得
export async function getAllImages(): Promise<SavedImage[]> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("timestamp")
    const request = index.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error("画像の取得に失敗しました"))
    }
  })
}

// 画像を削除
export async function deleteImage(id: string): Promise<void> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("画像の削除に失敗しました"))
    }
  })
}

// 最新の画像を取得
export async function getLatestImage(): Promise<SavedImage | null> {
  const images = await getAllImages()
  if (images.length === 0) {
    return null
  }
  
  // タイムスタンプでソートして最新を返す
  const sorted = images.sort((a, b) => b.timestamp - a.timestamp)
  return sorted[0]
}

// ストレージの使用量を取得（概算）
export async function getStorageUsage(): Promise<number> {
  const images = await getAllImages()
  let totalSize = 0
  
  for (const image of images) {
    // base64データのサイズを概算（約4/3倍）
    totalSize += image.dataUrl.length * 0.75
  }
  
  return totalSize
}
