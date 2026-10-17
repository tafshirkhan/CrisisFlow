
import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { Readable } from 'node:stream';

const UPLOAD_DIRECTORY = resolve(process.cwd(), 'uploads', 'incidents');

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

export const storeIncidentFile = async (
  fileStream: Readable,
  mimeType: string,
): Promise<StoredFile> => {
  const extension = ALLOWED_EXTENSIONS[mimeType];

  if (!extension) {
    throw new Error('Unsupported attachment type');
  }

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });

  // Generate the filename ourselves; never trust the supplied filename.
  const storageKey = `${randomUUID()}${extension}`;
  const filePath = join(UPLOAD_DIRECTORY, storageKey);

  let fileSizeBytes = 0;

  fileStream.on('data', (chunk: Buffer | string) => {
    fileSizeBytes += Buffer.byteLength(chunk);
  });

  try {
    await pipeline(fileStream, createWriteStream(filePath));

    if (fileSizeBytes <= 0) {
      await rm(filePath, { force: true });
      throw new Error('Empty files are not allowed');
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
  // Accept only generated UUID filenames with an approved extension.
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|mp4)$/i.test(storageKey)) {
    throw new Error('Invalid storage key');
  }

  const filePath = resolve(UPLOAD_DIRECTORY, storageKey);

  await rm(filePath, { force: true });
};
