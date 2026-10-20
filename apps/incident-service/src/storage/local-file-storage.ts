
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve, sep  } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const UPLOAD_DIRECTORY = resolve(
  process.cwd(),
  'uploads',
  'incidents',
);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const SIGNATURE_HEADER_SIZE = 12;

const ALLOWED_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
};

export interface StoredFile {
  storageKey: string;
  fileSizeBytes: number;
}


export class InvalidFileSignatureError extends Error {
  constructor(message = 'File content does not match declared MIME type') {
    super(message);
    this.name = 'InvalidFileSignatureError';
  }
}


const hasValidSignature = (
  header: Buffer,
  mimeType: string,
): boolean => {
  switch (mimeType) {
    case 'image/jpeg':
      return (
        header.length >= 3 &&
        header[0] === 0xff &&
        header[1] === 0xd8 &&
        header[2] === 0xff
      );

    case 'image/png':
      return (
        header.length >= 8 &&
        header.subarray(0, 8).equals(
          Buffer.from([
            0x89, 0x50, 0x4e, 0x47,
            0x0d, 0x0a, 0x1a, 0x0a,
          ]),
        )
      );

    case 'image/webp':
      return (
        header.length >= 12 &&
        header.toString('ascii', 0, 4) === 'RIFF' &&
        header.toString('ascii', 8, 12) === 'WEBP'
      );

    case 'video/mp4':
      return (
        header.length >= 8 &&
        header.toString('ascii', 4, 8) === 'ftyp'
      );

    default:
      return false;
  }
};

export const storeIncidentFile = async (
  fileStream: Readable,
  mimeType: string,
): Promise<StoredFile> => {
  const extension = ALLOWED_EXTENSIONS[mimeType];

  if (!extension) {
    throw new Error('Unsupported attachment type');
  }

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });

  const storageKey = `${randomUUID()}${extension}`;
  const filePath = join(UPLOAD_DIRECTORY, storageKey);

  let fileSizeBytes = 0;
  let header = Buffer.alloc(0);
  let signatureValidated = false;

  const validateAndLimit = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk);

      fileSizeBytes += buffer.length;

      if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
        callback(new Error('File exceeds the 50 MiB limit'));
        return;
      }

      if (signatureValidated) {
        callback(null, buffer);
        return;
      }

      // Buffer only the first 12 bytes until the signature is checked.
      header = Buffer.concat([header, buffer]);

      if (header.length < SIGNATURE_HEADER_SIZE) {
        callback();
        return;
      }

      // if (!hasValidSignature(header, mimeType)) {
      //   callback(new Error('File content does not match its MIME type'));
      //   return;
      // }
      if (!hasValidSignature(header, mimeType)) {
        callback(new InvalidFileSignatureError());
        return;
      }

      signatureValidated = true;
      callback(null, header);
      header = Buffer.alloc(0);
    },

    flush(callback) {
      // Handle short files and validate files shorter than 12 bytes.
      if (!signatureValidated) {
        // if (!hasValidSignature(header, mimeType)) {
        //   callback(new Error('Invalid or incomplete file signature'));
        //   return;
        // }
        if (!hasValidSignature(header, mimeType)) {
          callback(new InvalidFileSignatureError('Invalid or incomplete file signature'));
          return;
        }

        signatureValidated = true;
        this.push(header);
        header = Buffer.alloc(0);
      }

      if (fileSizeBytes === 0) {
        callback(new Error('Empty files are not allowed'));
        return;
      }

      callback();
    },
  });

  
try {
  await pipeline(
    fileStream,
    validateAndLimit,
    createWriteStream(filePath, { flags: 'wx' }),
  );

  // Fastify's multipart stream can stop at its configured file-size
  // limit without passing the excess bytes to this pipeline.
  if (
    'truncated' in fileStream &&
    fileStream.truncated === true
  ) {
    const error = new Error('File exceeds the 50 MiB limit') as Error & {
      code: string;
    };
    error.code = 'FST_REQ_FILE_TOO_LARGE';
    throw error;
  }

  return {
    storageKey,
    fileSizeBytes,
  };
} catch (error) {
  await rm(filePath, { force: true });
  throw error;
}

};

export const deleteStoredIncidentFile = async (
  storageKey: string,
): Promise<void> => {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/i.test(storageKey)) {
    throw new Error('Invalid storage key');
  }

  const filePath = resolve(UPLOAD_DIRECTORY, storageKey);

  // Ensure the resolved path remains inside the upload directory.
  if (!filePath.startsWith(`${UPLOAD_DIRECTORY}${sep}`)) {
  throw new Error('Invalid storage path');
}

  await rm(filePath, { force: true });
};

//Validates that the storage key follows the expected UUID filename format.
//Allows only .jpg, .png, .webp, and .mp4 extensions.
//Resolves the file path inside the configured upload directory.
export const getStoredIncidentFilePath = (
  storageKey: string,
): string => {
  // Accept only generated UUID filenames with supported extensions.
  const validStorageKey =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|mp4)$/i;

  if (!validStorageKey.test(storageKey)) {
    throw new Error('Invalid storage key');
  }

  const filePath = resolve(UPLOAD_DIRECTORY, storageKey);

  // Prevent directory traversal outside the upload directory.
  if (!filePath.startsWith(`${UPLOAD_DIRECTORY}${sep}`)) {
    throw new Error('Invalid storage path');
  }

  return filePath;
};
