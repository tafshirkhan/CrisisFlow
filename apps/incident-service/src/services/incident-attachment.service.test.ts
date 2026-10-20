
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Readable } from 'node:stream';

import { findIncidentById } from '../repositories/incident.repository.js';
import {
  createIncidentAttachment,
} from '../repositories/incident-attachment.repository.js';
import {
  deleteStoredIncidentFile,
  storeIncidentFile,
} from '../storage/local-file-storage.js';

import {
  AttachmentIncidentNotFoundError,
  UnsupportedAttachmentTypeError,
  uploadIncidentAttachment,
} from './incident-attachment.service.js';

vi.mock('../repositories/incident.repository.js', () => ({
  findIncidentById: vi.fn(),
}));

vi.mock('../repositories/incident-attachment.repository.js', () => ({
  createIncidentAttachment: vi.fn(),
}));

vi.mock('../storage/local-file-storage.js', () => ({
  storeIncidentFile: vi.fn(),
  deleteStoredIncidentFile: vi.fn(),
}));

const INCIDENT_ID = 'c7d20d5c-da10-42e0-8c10-7e6c48ad3265';

const STORAGE_KEY = '84f10a71-9ccb-4da7-ba4a-4a41dcd6b1da.jpg';

const createInput = () => ({
  incidentId: INCIDENT_ID,
  fileName: 'images.jpg',
  mimeType: 'image/jpeg',
  fileStream: Readable.from(Buffer.from('test-image-data')),
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('uploadIncidentAttachment', () => {
  it('rejects an upload when the incident does not exist', async () => {
    vi.mocked(findIncidentById).mockResolvedValue(null);

    await expect(
      uploadIncidentAttachment(createInput()),
    ).rejects.toBeInstanceOf(AttachmentIncidentNotFoundError);

    expect(storeIncidentFile).not.toHaveBeenCalled();
    expect(createIncidentAttachment).not.toHaveBeenCalled();
  });

  it('rejects an unsupported MIME type', async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: INCIDENT_ID,
    } as never);

    await expect(
      uploadIncidentAttachment({
        ...createInput(),
        mimeType: 'application/pdf',
      }),
    ).rejects.toBeInstanceOf(UnsupportedAttachmentTypeError);

    expect(storeIncidentFile).not.toHaveBeenCalled();
  });

  it('stores the file and saves its metadata', async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: INCIDENT_ID,
    } as never);

    vi.mocked(storeIncidentFile).mockResolvedValue({
      storageKey: STORAGE_KEY,
      fileSizeBytes: 22592,
    });

    const savedAttachment = {
      id: 'f1cb68b2-38ec-4354-821f-43ccc8957234',
      incident_id: INCIDENT_ID,
      file_name: 'images.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: '22592',
    };

    vi.mocked(createIncidentAttachment).mockResolvedValue(
      savedAttachment as never,
    );

    const result = await uploadIncidentAttachment(createInput());

    expect(storeIncidentFile).toHaveBeenCalledWith(
      expect.any(Object),
      'image/jpeg',
    );

    expect(createIncidentAttachment).toHaveBeenCalledWith({
      incidentId: INCIDENT_ID,
      fileName: 'images.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 22592,
      storageKey: STORAGE_KEY,
      uploadedBy: null,
    });

    expect(result).toEqual(savedAttachment);
  });

  it('deletes the stored file if saving metadata fails', async () => {
    vi.mocked(findIncidentById).mockResolvedValue({
      id: INCIDENT_ID,
    } as never);

    vi.mocked(storeIncidentFile).mockResolvedValue({
      storageKey: STORAGE_KEY,
      fileSizeBytes: 22592,
    });

    const databaseError = new Error('Database insert failed');

    vi.mocked(createIncidentAttachment).mockRejectedValue(databaseError);
    vi.mocked(deleteStoredIncidentFile).mockResolvedValue(undefined);

    await expect(
      uploadIncidentAttachment(createInput()),
    ).rejects.toBe(databaseError);

    expect(deleteStoredIncidentFile).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
