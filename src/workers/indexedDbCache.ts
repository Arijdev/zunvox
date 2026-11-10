const DATABASE = "docuswift-ai-model-cache";
const STORE = "model-files";
const CHUNK_STORE = "model-file-chunks";
const VERSION = 2;
const CHUNK_SIZE = 1024 * 1024;

type CachedResponse = {
  body?: ArrayBuffer;
  chunkCount?: number;
  headers: [string, string][];
  status: number;
  statusText: string;
};

type CacheProgress = { progress: number; loaded: number; total: number };
let progressListener: ((data: CacheProgress) => void) | undefined;

export function setModelCacheProgressListener(
  listener?: (data: CacheProgress) => void,
) {
  progressListener = listener;
}

type ModelCache = {
  match: (request: string) => Promise<Response | undefined>;
  put: (
    request: string,
    response: Response,
    progress?: (data: CacheProgress) => void,
  ) => Promise<void>;
  delete: (request: string) => Promise<boolean>;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
      if (!request.result.objectStoreNames.contains(CHUNK_STORE)) {
        request.result.createObjectStore(CHUNK_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open the model cache."));
    request.onblocked = () =>
      reject(new Error("The model cache is busy in another browser tab."));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
  storeName = STORE,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, mode);
    const request = operation(tx.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("The model cache operation failed."));
    tx.onabort = () =>
      reject(tx.error ?? new Error("The model cache transaction was aborted."));
    tx.oncomplete = () => database.close();
    tx.onerror = () => database.close();
  });
}

async function removeLegacyEntry(request: string) {
  await transaction<undefined>("readwrite", (store) => store.delete(request));
}

async function writeChunkedResponse(
  request: string,
  entry: CachedResponse,
  body: ArrayBuffer,
) {
  const database = await openDatabase();
  const chunkCount = entry.chunkCount;
  if (chunkCount === undefined) {
    database.close();
    throw new Error("The cached model file has no chunk count.");
  }
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction([STORE, CHUNK_STORE], "readwrite");
    const chunks = tx.objectStore(CHUNK_STORE);
    tx.objectStore(STORE).put(entry, request);
    for (let index = 0; index < chunkCount; index += 1) {
      const start = index * CHUNK_SIZE;
      chunks.put(
        body.slice(start, Math.min(start + CHUNK_SIZE, body.byteLength)),
        `${request}::${index}`,
      );
    }
    tx.oncomplete = () => {
      database.close();
      resolve();
    };
    tx.onabort = () => {
      database.close();
      reject(tx.error ?? new Error("The model cache transaction was aborted."));
    };
    tx.onerror = () => {
      database.close();
      reject(tx.error ?? new Error("The model cache transaction failed."));
    };
  });
}

export const indexedDbCache: ModelCache = {
  async match(request) {
    let entry: CachedResponse | undefined;
    try {
      entry = await transaction<CachedResponse | undefined>("readonly", (store) =>
        store.get(request),
      );
    } catch (error) {
      if (!(error instanceof Error) || !/large IndexedDB value/i.test(error.message)) {
        throw error;
      }
      await removeLegacyEntry(request);
      return undefined;
    }
    if (!entry) return undefined;
    if (entry.body) {
      return new Response(entry.body, {
        headers: entry.headers,
        status: entry.status,
        statusText: entry.statusText,
      });
    }
    if (entry.chunkCount === undefined) return undefined;
    if (entry.chunkCount === 0) {
      return new Response(new ArrayBuffer(0), {
        headers: entry.headers,
        status: entry.status,
        statusText: entry.statusText,
      });
    }

    let nextChunk = 0;
    const chunkCount = entry.chunkCount;
    const body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (nextChunk >= chunkCount) {
          controller.close();
          return;
        }
        const key = `${request}::${nextChunk}`;
        const chunk = await transaction<ArrayBuffer | undefined>(
          "readonly",
          (store) => store.get(key),
          CHUNK_STORE,
        );
        if (!chunk) {
          controller.error(new Error("A cached model file is incomplete."));
          return;
        }
        controller.enqueue(new Uint8Array(chunk));
        nextChunk += 1;
      },
    });
    return new Response(body, {
      headers: entry.headers,
      status: entry.status,
      statusText: entry.statusText,
    });
  },
  async put(request, response, onProgress) {
    const total = Number(response.headers.get("content-length")) || 0;
    let body: ArrayBuffer;
    if (response.body) {
      const reader = response.body.getReader();
      let chunks: Uint8Array[] | undefined;
      let combined = total > 0 ? new Uint8Array(total) : undefined;
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          if (!combined || loaded + value.byteLength > combined.byteLength) {
            chunks ??= combined ? [combined.subarray(0, loaded)] : [];
            const capacity = Math.max(
              loaded + value.byteLength,
              combined ? combined.byteLength * 2 : value.byteLength,
            );
            const expanded = new Uint8Array(capacity);
            if (combined) expanded.set(combined.subarray(0, loaded));
            combined = expanded;
          }
          if (chunks) chunks.push(value);
          else combined.set(value, loaded);
          loaded += value.byteLength;
          const progress = {
            loaded,
            total,
            progress: total > 0 ? Math.min(100, (loaded / total) * 100) : 0,
          };
          onProgress?.(progress);
          progressListener?.(progress);
        }
      }
      if (chunks) {
        const exact = new Uint8Array(loaded);
        let offset = 0;
        for (const chunk of chunks) {
          exact.set(chunk, offset);
          offset += chunk.byteLength;
        }
        body = exact.buffer;
      } else {
        const received = combined ?? new Uint8Array(0);
        body =
          received.byteLength === loaded
            ? received.buffer
            : received.slice(0, loaded).buffer;
      }
    } else {
      body = await response.arrayBuffer();
      const progress = {
        loaded: body.byteLength,
        total: total || body.byteLength,
        progress: 100,
      };
      onProgress?.(progress);
      progressListener?.(progress);
    }
    const entry: CachedResponse = {
      chunkCount: Math.ceil(body.byteLength / CHUNK_SIZE),
      headers: Array.from(response.headers.entries()),
      status: response.status,
      statusText: response.statusText,
    };
    if (entry.chunkCount === 0) {
      entry.body = body;
      await transaction<IDBValidKey>("readwrite", (store) => store.put(entry, request));
    } else {
      await writeChunkedResponse(request, entry, body);
    }
  },
  async delete(request) {
    let exists: CachedResponse | undefined;
    try {
      exists = await transaction<CachedResponse | undefined>("readonly", (store) =>
        store.get(request),
      );
    } catch (error) {
      if (!(error instanceof Error) || !/large IndexedDB value/i.test(error.message)) {
        throw error;
      }
      exists = { headers: [], status: 200, statusText: "OK" };
    }
    if (!exists) return false;
    const database = await openDatabase();
    return new Promise<boolean>((resolve, reject) => {
      const tx = database.transaction([STORE, CHUNK_STORE], "readwrite");
      tx.objectStore(STORE).delete(request);
      const range = IDBKeyRange.bound(`${request}::`, `${request}::\uffff`);
      const cursorRequest = tx.objectStore(CHUNK_STORE).openCursor(range);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      tx.oncomplete = () => {
        database.close();
        resolve(true);
      };
      tx.onabort = () => {
        database.close();
        reject(tx.error ?? new Error("The model cache transaction was aborted."));
      };
      tx.onerror = () => {
        database.close();
        reject(tx.error ?? new Error("The model cache transaction failed."));
      };
    });
  },
};
