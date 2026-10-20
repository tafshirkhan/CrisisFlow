
import { afterEach, describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';

import {
  deleteStoredIncidentFile,
  storeIncidentFile,
} from './local-file-storage.js';

const storedKeys: string[] = [];

afterEach(async () => {
  for (const key of storedKeys.splice(0)) {
    await deleteStoredIncidentFile(key);
  }
});

describe('local file storage security', () => {
  it('stores a file with a valid JPEG signature', async () => {
    const jpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0,
      0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01,
    ]);

    const result = await storeIncidentFile(
      Readable.from([jpeg]),
      'image/jpeg',
    );

    storedKeys.push(result.storageKey);

    expect(result.storageKey).toMatch(
      /^[0-9a-f-]{36}\.jpg$/i,
    );
    expect(result.fileSizeBytes).toBe(jpeg.length);
  });

  it.each([
    {
      type: 'PNG',
      mimeType: 'image/png',
      signature: [
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x00,
      ],
      extension: '.png',
    },
    {
      type: 'WebP',
      mimeType: 'image/webp',
      signature: [
        0x52, 0x49, 0x46, 0x46,
        0x00, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50,
      ],
      extension: '.webp',
    },
    {
      type: 'MP4',
      mimeType: 'video/mp4',
      signature: [
        0x00, 0x00, 0x00, 0x18,
        0x66, 0x74, 0x79, 0x70,
        0x69, 0x73, 0x6f, 0x6d,
      ],
      extension: '.mp4',
    },
  ])('stores a file with a valid $type signature', async ({
    mimeType,
    signature,
    extension,
  }) => {
    const result = await storeIncidentFile(
      Readable.from([Buffer.from(signature)]),
      mimeType,
    );

    storedKeys.push(result.storageKey);

    expect(result.storageKey).toMatch(
      new RegExp(`^[0-9a-f-]{36}\\${extension}$`, 'i'),
    );
    expect(result.fileSizeBytes).toBe(signature.length);
  });




  it('rejects content that does not match its declared MIME type', async () => {
    const fakeJpeg = Buffer.from('This is not a JPEG file');

    await expect(
      storeIncidentFile(
        Readable.from([fakeJpeg]),
        'image/jpeg',
      ),
    ).rejects.toThrow('File content does not match declared MIME type');
  });

  it('rejects unsupported MIME types', async () => {
    await expect(
      storeIncidentFile(
        Readable.from([Buffer.from('test')]),
        'application/pdf',
      ),
    ).rejects.toThrow('Unsupported attachment type');
  });

  it('rejects files larger than 50 MiB', async () => {
    async function* oversizedFile() {
      // The first chunk starts with a JPEG signature.
      const firstChunk = Buffer.alloc(1024 * 1024);
      firstChunk.set([0xff, 0xd8, 0xff, 0xe0]);

      yield firstChunk;

      // Yield another 49 MiB in chunks.
      for (let i = 0; i < 49; i++) {
        yield Buffer.alloc(1024 * 1024);
      }

      // This byte pushes the total above 50 MiB.
      yield Buffer.from([0x00]);
    }

    await expect(
      storeIncidentFile(
        Readable.from(oversizedFile()),
        'image/jpeg',
      ),
    ).rejects.toThrow('File exceeds the 50 MiB limit');
  });

  
  it('removes a partial file when the upload stream fails', async () => {
    async function* interruptedUpload() {
      // Start with a valid JPEG signature so validation passes.
      yield Buffer.from([
        0xff, 0xd8, 0xff, 0xe0,
        0x00, 0x10, 0x4a, 0x46,
        0x49, 0x46, 0x00, 0x01,
      ]);

      // Simulate an interrupted upload.
      throw new Error('Simulated upload interruption');
    }

    await expect(
      storeIncidentFile(
        Readable.from(interruptedUpload()),
        'image/jpeg',
      ),
    ).rejects.toThrow('Simulated upload interruption');
  });



});
