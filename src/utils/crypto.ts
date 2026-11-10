const MAGIC = new TextEncoder().encode("ZUNVOXVT");
// Preserve the legacy signature so existing .kurox vault files remain decryptable.
const LEGACY_MAGIC = new TextEncoder().encode("KUROXVT1");
const SALT_LENGTH = 16;
const NONCE_PREFIX_LENGTH = 8;
const HEADER_LENGTH = MAGIC.length + SALT_LENGTH + NONCE_PREFIX_LENGTH;
const METADATA_SIZE = 1024;
const TAG_LENGTH_BYTES = 16;
const CHUNK_SIZE = 256 * 1024;
const PBKDF2_ITERATIONS = 600_000;
const MAX_FILE_SIZE = 1024 * 1024 * 1024;
const MAX_VAULT_SIZE = MAX_FILE_SIZE + CHUNK_SIZE + 64 * 1024;
const MAX_CHUNKS = 0xffff_fffe;

export type VaultProgress = (percent: number, phase: string) => void;

export type DecryptedVault = {
  blob: Blob;
  filename: string;
};

function requireCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error("Web Crypto is unavailable. Use a current browser in a secure context (HTTPS).");
  }
}

function makeHeader(salt: Uint8Array, noncePrefix: Uint8Array) {
  const header = new Uint8Array(HEADER_LENGTH);
  header.set(MAGIC, 0);
  header.set(salt, MAGIC.length);
  header.set(noncePrefix, MAGIC.length + SALT_LENGTH);
  return header;
}

function frameNonce(noncePrefix: Uint8Array, counter: number) {
  const nonce = new Uint8Array(12);
  nonce.set(noncePrefix, 0);
  new DataView(nonce.buffer).setUint32(NONCE_PREFIX_LENGTH, counter, false);
  return nonce;
}

function frameAad(header: Uint8Array, counter: number, isMetadata: boolean) {
  const aad = new Uint8Array(header.length + 5);
  aad.set(header, 0);
  const view = new DataView(aad.buffer);
  view.setUint32(header.length, counter, false);
  view.setUint8(header.length + 4, isMetadata ? 0 : 1);
  return aad;
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const passwordBytes = new TextEncoder().encode(password);
  const passwordBuffer = toArrayBuffer(passwordBytes);
  let rawKey: Uint8Array | undefined;
  let rawKeyBuffer: ArrayBuffer | undefined;
  try {
    const material = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    rawKey = new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: toArrayBuffer(salt),
          iterations: PBKDF2_ITERATIONS,
        },
        material,
        256,
      ),
    );
    rawKeyBuffer = toArrayBuffer(rawKey);
    return await crypto.subtle.importKey("raw", rawKeyBuffer, "AES-GCM", false, [
      "encrypt", "decrypt",
    ]);
  } finally {
    passwordBytes.fill(0);
    new Uint8Array(passwordBuffer).fill(0);
    rawKey?.fill(0);
    if (rawKeyBuffer) new Uint8Array(rawKeyBuffer).fill(0);
  }
}

function encodeMetadata(file: File) {
  const payload = new Uint8Array(METADATA_SIZE);
  const json = new TextEncoder().encode(
    JSON.stringify({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    }),
  );
  if (json.length > METADATA_SIZE) {
    json.fill(0);
    payload.fill(0);
    throw new Error("File metadata is too large to encrypt.");
  }
  payload.set(json);
  json.fill(0);
  return payload;
}

function decodeMetadata(bytes: Uint8Array) {
  try {
    const terminator = bytes.indexOf(0);
    const jsonBytes = terminator < 0 ? bytes : bytes.subarray(0, terminator);
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(jsonBytes));
    if (
      typeof value !== "object" ||
      value === null ||
      !("name" in value) ||
      typeof value.name !== "string" ||
      !("type" in value) ||
      typeof value.type !== "string" ||
      !("size" in value) ||
      typeof value.size !== "number" ||
      !Number.isSafeInteger(value.size) ||
      value.size < 0 ||
      value.size > MAX_FILE_SIZE
    ) {
      throw new Error("Invalid metadata");
    }
    return {
      name: value.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") || "restored-file",
      type: value.type || "application/octet-stream",
      size: value.size,
    };
  } catch {
    throw new Error("This vault file is damaged or the passphrase is incorrect.");
  }
}

export async function encryptFile(
  file: File,
  password: string,
  onProgress: VaultProgress = () => {},
) {
  requireCrypto();
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Files larger than 1 GB are not supported by this browser vault.");
  }
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  if (chunkCount > MAX_CHUNKS) throw new Error("This file is too large for the Zunvox Vault format.");

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const noncePrefix = crypto.getRandomValues(new Uint8Array(NONCE_PREFIX_LENGTH));
  const header = makeHeader(salt, noncePrefix);
  const key = await deriveKey(password, salt);
  const parts: BlobPart[] = [toArrayBuffer(header)];
  const metadata = encodeMetadata(file);
  const metadataBuffer = toArrayBuffer(metadata);
  try {
    const encryptedMetadata = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(frameNonce(noncePrefix, 0)),
        additionalData: toArrayBuffer(frameAad(header, 0, true)),
        tagLength: 128,
      },
      key,
      metadataBuffer,
    );
    parts.push(encryptedMetadata);
  } finally {
    metadata.fill(0);
    new Uint8Array(metadataBuffer).fill(0);
  }

  for (let index = 0; index < chunkCount; index += 1) {
    const start = index * CHUNK_SIZE;
    const source = new Uint8Array(
      await file.slice(start, Math.min(file.size, start + CHUNK_SIZE)).arrayBuffer(),
    );
    const plaintext = new Uint8Array(CHUNK_SIZE);
    plaintext.set(source);
    source.fill(0);
    const plaintextBuffer = toArrayBuffer(plaintext);
    try {
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(frameNonce(noncePrefix, index + 1)),
          additionalData: toArrayBuffer(frameAad(header, index + 1, false)),
          tagLength: 128,
        },
        key,
        plaintextBuffer,
      );
      parts.push(ciphertext);
    } finally {
      plaintext.fill(0);
      new Uint8Array(plaintextBuffer).fill(0);
    }
    onProgress(Math.round(((index + 1) / Math.max(chunkCount, 1)) * 100), "Encrypting file chunks");
  }

  return new Blob(parts, { type: "application/vnd.zunvox.vault" });
}

export async function decryptFile(
  file: File,
  password: string,
  onProgress: VaultProgress = () => {},
): Promise<DecryptedVault> {
  requireCrypto();
  if (file.size > MAX_VAULT_SIZE) {
    throw new Error("This vault file exceeds the supported 1 GB original-file limit.");
  }
  const headerBuffer = await file.slice(0, HEADER_LENGTH).arrayBuffer();
  if (headerBuffer.byteLength !== HEADER_LENGTH) {
    throw new Error("This is not a valid Zunvox Vault file.");
  }
  const header = new Uint8Array(headerBuffer);
  const isCurrentFormat = MAGIC.every((byte, index) => header[index] === byte);
  const isLegacyFormat = LEGACY_MAGIC.every(
    (byte, index) => header[index] === byte,
  );
  if (!isCurrentFormat && !isLegacyFormat) {
    header.fill(0);
    throw new Error("This is not a supported Zunvox Vault file.");
  }

  const salt = header.slice(MAGIC.length, MAGIC.length + SALT_LENGTH);
  const noncePrefix = header.slice(MAGIC.length + SALT_LENGTH);
  const metadataStart = HEADER_LENGTH;
  const metadataEnd = metadataStart + METADATA_SIZE + TAG_LENGTH_BYTES;
  if (file.size < metadataEnd) {
    header.fill(0);
    salt.fill(0);
    noncePrefix.fill(0);
    throw new Error("This Zunvox Vault file is incomplete or damaged.");
  }

  let key: CryptoKey;
  try {
    key = await deriveKey(password, salt);
  } finally {
    salt.fill(0);
  }

  let metadataBytes: Uint8Array;
  try {
    const encryptedMetadata = await file.slice(metadataStart, metadataEnd).arrayBuffer();
    metadataBytes = new Uint8Array(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(frameNonce(noncePrefix, 0)),
          additionalData: toArrayBuffer(frameAad(header, 0, true)),
          tagLength: 128,
        },
        key,
        encryptedMetadata,
      ),
    );
  } catch {
    header.fill(0);
    noncePrefix.fill(0);
    throw new Error("The passphrase is incorrect or this vault file is damaged.");
  }

  let metadata: ReturnType<typeof decodeMetadata>;
  try {
    metadata = decodeMetadata(metadataBytes);
  } finally {
    metadataBytes.fill(0);
  }

  const expectedChunks = Math.ceil(metadata.size / CHUNK_SIZE);
  const expectedSize =
    HEADER_LENGTH +
    METADATA_SIZE +
    TAG_LENGTH_BYTES +
    expectedChunks * (CHUNK_SIZE + TAG_LENGTH_BYTES);
  if (expectedChunks > MAX_CHUNKS || expectedSize !== file.size) {
    header.fill(0);
    noncePrefix.fill(0);
    throw new Error("This Zunvox Vault file is incomplete or damaged.");
  }

  const parts: BlobPart[] = [];
  const plaintextBuffers: ArrayBuffer[] = [];
  let offset = metadataEnd;
  try {
    for (let index = 0; index < expectedChunks; index += 1) {
      const plaintextLength = Math.min(CHUNK_SIZE, metadata.size - index * CHUNK_SIZE);
      const ciphertextLength = CHUNK_SIZE + TAG_LENGTH_BYTES;
      const ciphertext = new Uint8Array(
        await file.slice(offset, offset + ciphertextLength).arrayBuffer(),
      );
      let plaintext: Uint8Array | undefined;
      try {
        plaintext = new Uint8Array(
          await crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: toArrayBuffer(frameNonce(noncePrefix, index + 1)),
              additionalData: toArrayBuffer(frameAad(header, index + 1, false)),
              tagLength: 128,
            },
            key,
            toArrayBuffer(ciphertext),
          ),
        );
        const output = toArrayBuffer(plaintext.subarray(0, plaintextLength));
        parts.push(output);
        plaintextBuffers.push(output);
      } catch {
        throw new Error("The passphrase is incorrect or this vault file is damaged.");
      } finally {
        ciphertext.fill(0);
        plaintext?.fill(0);
      }
      offset += ciphertextLength;
      onProgress(Math.round(((index + 1) / Math.max(expectedChunks, 1)) * 100), "Decrypting file chunks");
    }
  } catch (error) {
    header.fill(0);
    noncePrefix.fill(0);
    parts.length = 0;
    for (const buffer of plaintextBuffers) new Uint8Array(buffer).fill(0);
    throw error;
  }

  header.fill(0);
  noncePrefix.fill(0);
  onProgress(100, "Restoring original file");
  let blob: Blob;
  try {
    blob = new Blob(parts, { type: metadata.type });
  } finally {
    for (const buffer of plaintextBuffers) new Uint8Array(buffer).fill(0);
  }
  return { blob, filename: metadata.name };
}
