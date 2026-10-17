import { pool } from '../config/database.js';

export interface CreateIncidentAttachmentInput {
  incidentId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageKey: string;
  uploadedBy?: string | null;
}

// Save attachment metadata in PostgreSQL.
// The actual file is stored separately.
//CreateIncidentAttachmentInput defines the metadata required for an attachment.
//pool.query() inserts that metadata into your existing incident_attachments table
//storageKey identifies the file in storage; the actual image or video is not saved inside PostgreSQL.
export const createIncidentAttachment = async (
  attachment: CreateIncidentAttachmentInput,
) => {
  const result = await pool.query(
    `INSERT INTO incident_attachments (
      incident_id,
      file_name,
      mime_type,
      file_size_bytes,
      storage_key,
      uploaded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      incident_id,
      file_name,
      mime_type,
      file_size_bytes,
      storage_key,
      uploaded_by,
      uploaded_at`,
    [
      attachment.incidentId,
      attachment.fileName,
      attachment.mimeType,
      attachment.fileSizeBytes,
      attachment.storageKey,
      attachment.uploadedBy ?? null,
    ],
  );

  return result.rows[0];
};
