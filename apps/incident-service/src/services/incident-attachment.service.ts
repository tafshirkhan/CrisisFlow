
import type { Readable } from 'node:stream';

import { findIncidentById } from '../repositories/incident.repository.js';
import {
  createIncidentAttachment,
} from '../repositories/incident-attachment.repository.js';
import {
  deleteStoredIncidentFile,
  storeIncidentFile,
} from '../storage/local-file-storage.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]);

export class AttachmentIncidentNotFoundError extends Error {
  constructor() {
    super('Cannot upload an attachment: incident not found');
    this.name = 'AttachmentIncidentNotFoundError';
  }
}

export class UnsupportedAttachmentTypeError extends Error {
  constructor() {
    super('Only JPEG, PNG, WebP and MP4 files are allowed');
    this.name = 'UnsupportedAttachmentTypeError';
  }
}

export interface UploadIncidentAttachmentInput {
  incidentId: string;
  fileName: string;
  mimeType: string;
  fileStream: Readable;
  uploadedBy?: string | null;
}

export const uploadIncidentAttachment = async (
  input: UploadIncidentAttachmentInput,
) => {
  // 1. Confirm that the incident exists.
  const incident = await findIncidentById(input.incidentId);

  if (!incident) {
    throw new AttachmentIncidentNotFoundError();
  }

  // 2. Check the declared MIME type against the allowed types.
  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    throw new UnsupportedAttachmentTypeError();
  }

  // 3. Store the file using a generated storage key.
  const storedFile = await storeIncidentFile(
    input.fileStream,
    input.mimeType,
  );

  // Keep a safe display name; never use it as the physical storage filename.
  const safeFileName = input.fileName
    .replace(/[\\/]/g, '_')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 255);

  try {
    // 4. Save metadata after the file has been stored successfully.
    return await createIncidentAttachment({
      incidentId: input.incidentId,
      fileName: safeFileName || 'attachment',
      mimeType: input.mimeType,
      fileSizeBytes: storedFile.fileSizeBytes,
      storageKey: storedFile.storageKey,
      uploadedBy: input.uploadedBy ?? null,
    });
  } catch (error) {
    // 5. If the database insert fails, clean up the stored file.
    try {
      await deleteStoredIncidentFile(storedFile.storageKey);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Saving attachment metadata failed, and file cleanup also failed',
      );
    }

    throw error;
  }
};
