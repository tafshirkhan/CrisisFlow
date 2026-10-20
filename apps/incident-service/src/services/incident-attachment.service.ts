
import type { Readable } from 'node:stream';
import { stat } from 'node:fs/promises';

import { findIncidentById } from '../repositories/incident.repository.js';
import {
  createIncidentAttachment,
  findIncidentAttachmentById,
  listIncidentAttachmentsByIncidentId,
} from '../repositories/incident-attachment.repository.js';
import {
  deleteStoredIncidentFile,
  getStoredIncidentFilePath,
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


//This function retrieves the metadata and resolves the storage path. 
//The controller will later stream the file without exposing the physical path or storage_key in the response
export class IncidentAttachmentNotFoundError extends Error {
  constructor() {
    super('Incident attachment not found');
    this.name = 'IncidentAttachmentNotFoundError';
  }
}

export class IncidentAttachmentFileMissingError extends Error {
  constructor() {
    super('The stored attachment file is missing');
    this.name = 'IncidentAttachmentFileMissingError';
  }
}

// export const getIncidentAttachment = async (
//   attachmentId: string,
// ) => {
//   const attachment = await findIncidentAttachmentById(attachmentId);

//   if (!attachment) {
//     throw new IncidentAttachmentNotFoundError();
//   }

//   const filePath = getStoredIncidentFilePath(attachment.storage_key);

//   return {
//     attachment,
//     filePath,
//   };
// };

export const getIncidentAttachment = async (
  incidentId: string,
  attachmentId: string,
) => {
  const attachment =
    await findIncidentAttachmentById(attachmentId);

  // Return not found if the attachment doesn't exist
  // or belongs to another incident.
  if (
    !attachment ||
    attachment.incident_id !== incidentId
  ) {
    throw new IncidentAttachmentNotFoundError();
  }

  const filePath = getStoredIncidentFilePath(
    attachment.storage_key,
  );

  try {
    const fileInfo = await stat(filePath);

    if (!fileInfo.isFile()) {
      throw new IncidentAttachmentFileMissingError();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new IncidentAttachmentFileMissingError();
    }

    throw error;
  }

  return {
    attachment,
    filePath,
  };
};

//this check, a request for an invalid incident ID could return an empty array, making it appear that the incident exists but has no attachments
export const listIncidentAttachments = async (
  incidentId: string,
) => {
  const incident = await findIncidentById(incidentId);

  if (!incident) {
    throw new AttachmentIncidentNotFoundError();
  }

  const attachments =
    await listIncidentAttachmentsByIncidentId(incidentId);

  return attachments;
};
