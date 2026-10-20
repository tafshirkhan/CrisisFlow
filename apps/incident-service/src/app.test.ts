
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolve } from 'node:path';
import { buildApp } from './app.js';
import { createIncident, updateIncidentStatus, findIncidentById,listIncidents } from './repositories/incident.repository.js';
import { InvalidStatusTransitionError,} from './services/incident.service.js';
import { createIncidentAttachment, findIncidentAttachmentById,listIncidentAttachmentsByIncidentId } from './repositories/incident-attachment.repository.js';
import { storeIncidentFile, deleteStoredIncidentFile, InvalidFileSignatureError, getStoredIncidentFilePath  } from './storage/local-file-storage.js';


//MOCK FOR INCIDENT REPORT
vi.mock('./repositories/incident.repository.js', () => ({
  createIncident: vi.fn(),
  listIncidents: vi.fn(),
  findIncidentById: vi.fn(),
  updateIncidentStatus: vi.fn(),
}));


//MOCK FOR INCIDENT ATTACHMENT
vi.mock('./repositories/incident-attachment.repository.js', () => ({
  createIncidentAttachment: vi.fn(),
  findIncidentAttachmentById: vi.fn(),
  listIncidentAttachmentsByIncidentId: vi.fn(),
}));

vi.mock('./storage/local-file-storage.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./storage/local-file-storage.js')>();

  return {
    ...actual,
    storeIncidentFile: vi.fn(),
    deleteStoredIncidentFile: vi.fn(),
    getStoredIncidentFilePath: vi.fn(),
  };
});

describe('CrisisFlow API', () => {
  afterEach(() => {
    //vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('returns a healthy response from GET /health', async () => {
    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        status: 'ok',
        service: 'incident-service',
        message: 'CrisisFlow Incident Service is perfectly running!!!!',
      });
    } finally {
      await app.close();
    }
  });

  //POST TEST
  it('creates an incident through POST /api/v1/incidents', async () => {
    vi.mocked(createIncident).mockResolvedValueOnce({
      id: 'test-incident-id',
      reference_number: 'CF-TEST12345678',
      type: 'FIRE',
      description: 'Test fire incident',
      priority: 'MEDIUM',
      status: 'REPORTED',
      latitude: null,
      longitude: null,
      address: 'Test address',
      reported_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as never);

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: {
          'content-type': 'application/json',
        },
        payload: {
          type: 'FIRE',
          description: 'Test fire incident',
          address: 'Test address',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().message).toBe(
        'Incident created successfully',
      );
      expect(response.json().incident.reference_number).toBe(
        'CF-TEST12345678',
      );
      expect(createIncident).toHaveBeenCalledOnce();
    } finally {
      await app.close();
    }
  });

  //CANCELATION TEST
  const INCIDENT_ID = 'c7d20d5c-da10-42e0-8c10-7e6c48ad3265';
  it('cancels an incident successfully', async () => {
      vi.mocked(findIncidentById).mockResolvedValueOnce({
      id: INCIDENT_ID,
      reference_number: 'CF-TEST12345678',
      type: 'FIRE',
      description: 'Test fire incident',
      priority: 'MEDIUM',
      status: 'REPORTED',
      latitude: null,
      longitude: null,
      address: 'Test address',
      reported_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as never);

    vi.mocked(updateIncidentStatus).mockResolvedValueOnce({
      id: INCIDENT_ID,
      reference_number: 'CF-TEST12345678',
      type: 'FIRE',
      description: 'Test fire incident',
      priority: 'MEDIUM',
      status: 'CANCELLED',
      latitude: null,
      longitude: null,
      address: 'Test address',
      reported_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as never);

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/incidents/${INCIDENT_ID}/cancel`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().message).toBe(
        'Incident cancelled successfully',
      );
      expect(response.json().data.status).toBe('CANCELLED');
      expect(updateIncidentStatus).toHaveBeenCalledWith(
        INCIDENT_ID,
        'REPORTED',
        'CANCELLED',
      );
    } finally {
      await app.close();
    }
  });

  it('rejects cancellation when the status transition is invalid', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce({
    id: INCIDENT_ID,
    reference_number: 'CF-TEST12345678',
    type: 'FIRE',
    description: 'Test fire incident',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    latitude: null,
    longitude: null,
    address: 'Test address',
    reported_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as never);

    // vi.mocked(updateIncidentStatus).mockRejectedValueOnce(
    //   new InvalidStatusTransitionError(
    //     'UNDER_REVIEW',
    //     'CANCELLED',
    //   ),
    // );
    const app = buildApp();
    try {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/incidents/${INCIDENT_ID}/cancel`,
      });

      expect(response.statusCode).toBe(422);
      expect(response.json().currentStatus).toBe('UNDER_REVIEW');
      expect(response.json().requestedStatus).toBe('CANCELLED');
    } finally {
      await app.close();
    }
  });

  //LIST INCIDENTS TEST
  it('lists incidents through GET /api/v1/incidents', async () => {
  vi.mocked(listIncidents).mockResolvedValueOnce({
    data: [
      {
        id: INCIDENT_ID,
        reference_number: 'CF-TEST12345678',
        type: 'FIRE',
        description: 'Test fire incident',
        priority: 'MEDIUM',
        status: 'REPORTED',
        latitude: null,
        longitude: null,
        address: 'Test address',
        reported_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    pagination: {
      total: 1,
      limit: 20,
      offset: 0,
      hasMore: false,
    },
  } as never);

  const app = buildApp();

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/incidents',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(1);
    expect(response.json().data[0].status).toBe('REPORTED');
    expect(response.json().pagination.total).toBe(1);
    expect(listIncidents).toHaveBeenCalledOnce();
  } finally {
    await app.close();
  }
});

//GET SPECEFIC INCIDENT TEST
it('retrieves an incident by ID', async () => {
  vi.mocked(findIncidentById).mockResolvedValueOnce({
    id: INCIDENT_ID,
    reference_number: 'CF-TEST12345678',
    type: 'FIRE',
    description: 'Test fire incident',
    priority: 'MEDIUM',
    status: 'REPORTED',
    latitude: null,
    longitude: null,
    address: 'Test address',
    reported_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as never);

  const app = buildApp();

  try {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/incidents/${INCIDENT_ID}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.id).toBe(INCIDENT_ID);
    expect(response.json().data.type).toBe('FIRE');
  } finally {
    await app.close();
  }
});

//MISSING INCIDENT TEST
it('returns 404 when an incident does not exist', async () => {
  vi.mocked(findIncidentById).mockResolvedValueOnce(null as never);

  const app = buildApp();

  try {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/incidents/${INCIDENT_ID}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().message).toBe(
      'Oppsss, Incident deatails not found try again with accurate  information!!!',
    );
  } finally {
    await app.close();
  }
});

//UPDATE STATUS INCIDENT TEST
it('updates an incident status through PATCH', async () => {
  vi.mocked(findIncidentById).mockResolvedValueOnce({
    id: INCIDENT_ID,
    reference_number: 'CF-TEST12345678',
    type: 'FIRE',
    description: 'Test fire incident',
    priority: 'MEDIUM',
    status: 'REPORTED',
    latitude: null,
    longitude: null,
    address: 'Test address',
    reported_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as never);

  vi.mocked(updateIncidentStatus).mockResolvedValueOnce({
    id: INCIDENT_ID,
    reference_number: 'CF-TEST12345678',
    type: 'FIRE',
    description: 'Test fire incident',
    priority: 'MEDIUM',
    status: 'RECEIVED',
    latitude: null,
    longitude: null,
    address: 'Test address',
    reported_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as never);

  const app = buildApp();

  try {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/incidents/${INCIDENT_ID}/status`,
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        status: 'RECEIVED',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe(
      'Incident status updated successfully',
    );
    expect(response.json().data.status).toBe('RECEIVED');

    expect(updateIncidentStatus).toHaveBeenCalledWith(
      INCIDENT_ID,
      'REPORTED',
      'RECEIVED',
    );
  } 
  finally {
    await app.close();
  }
  });
  
  //INCIDENT ATTCHMENT
  //A valid JPEG-signature multipart request returns 201 and doesn't expose storage_key
  //A request without a file returns 400.
  //An upload to a nonexistent incident returns 404 without storing a file.
  it('uploads an attachment through POST /api/v1/incidents/:id/attachments', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce({
      id: INCIDENT_ID,
    } as never);

    vi.mocked(storeIncidentFile).mockResolvedValueOnce({
      storageKey: '84f10a71-9ccb-4da7-ba4a-4a41dcd6b1da.jpg',
      fileSizeBytes: 22592,
    });

    vi.mocked(createIncidentAttachment).mockResolvedValueOnce({
      id: 'f1cb68b2-38ec-4354-821f-43ccc8957234',
      incident_id: INCIDENT_ID,
      file_name: 'images.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: '22592',
      storage_key: '84f10a71-9ccb-4da7-ba4a-4a41dcd6b1da.jpg',
      uploaded_by: null,
      uploaded_at: new Date(),
    } as never);

    const app = buildApp();

    try {
      const boundary = 'test-boundary';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="images.jpg"',
        'Content-Type: image/jpeg',
        '',
        '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01',
        `--${boundary}--`,
        '',
      ].join('\r\n');

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload: Buffer.from(body, 'binary'),
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().message).toBe(
        'Incident attachment uploaded successfully',
      );
      expect(response.json().attachment.incident_id).toBe(INCIDENT_ID);
      expect(response.json().attachment.storage_key).toBeUndefined();
      expect(storeIncidentFile).toHaveBeenCalledOnce();
      expect(createIncidentAttachment).toHaveBeenCalledOnce();
    } finally {
      await app.close();
    }
  });

  
  it('returns 415 when uploading an unsupported file type', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce({
      id: INCIDENT_ID,
    } as never);

    const app = buildApp();

    try {
      const boundary = 'unsupported-file-boundary';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="document.pdf"',
        'Content-Type: application/pdf',
        '',
        'Test PDF content',
        `--${boundary}--`,
        '',
      ].join('\r\n');

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload: body,
      });

      expect(response.statusCode).toBe(415);
      expect(response.json().message).toBeDefined();
      expect(storeIncidentFile).not.toHaveBeenCalled();
      expect(createIncidentAttachment).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  
// it('returns 413 when an uploaded file exceeds 50 MiB', async () => {
//   vi.mocked(findIncidentById).mockResolvedValueOnce({
//     id: INCIDENT_ID,
//   } as never);

//   const app = buildApp();
//     const sizeLimitError = Object.assign(
//     new Error('The uploaded file exceeds the 50 MB limit'),
//     { code: 'FST_REQ_FILE_TOO_LARGE' },
//   );

// vi.mocked(storeIncidentFile).mockRejectedValueOnce(sizeLimitError);

//   try {
//     const boundary = 'oversized-file-boundary';

//     const body = [
//       `--${boundary}`,
//       'Content-Disposition: form-data; name="file"; filename="large.jpg"',
//       'Content-Type: image/jpeg',
//       '',
//       '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01',
//       `--${boundary}--`,
//       '',
//     ].join('\r\n');

//     const response = await app.inject({
//       method: 'POST',
//       url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
//       headers: {
//         'content-type': `multipart/form-data; boundary=${boundary}`,
//       },
//       payload: Buffer.from(body, 'binary'),
//     });

//     expect(response.statusCode).toBe(413);
//     expect(storeIncidentFile).toHaveBeenCalled();
//     expect(createIncidentAttachment).not.toHaveBeenCalled();
//   } finally {
//     await app.close();
//   }
// });


it('returns 413 when an uploaded file exceeds 50 MiB', async () => {
  vi.mocked(findIncidentById).mockResolvedValueOnce({
    id: INCIDENT_ID,
  } as never);

  // Use the real storage implementation for this test.
  vi.mocked(storeIncidentFile).mockImplementationOnce(
    async (fileStream, mimeType) => {
      const { storeIncidentFile: realStoreIncidentFile } =
        await vi.importActual<
          typeof import('./storage/local-file-storage.js')
        >('./storage/local-file-storage.js');

      return realStoreIncidentFile(fileStream, mimeType);
    },
  );

  const app = buildApp();

  try {
    const boundary = 'real-oversized-file-boundary';
    const fileSize = 50 * 1024 * 1024 + 1;

    const header = Buffer.from(
      `--${boundary}\r\n` +
        'Content-Disposition: form-data; name="file"; filename="large.jpg"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n',
      'utf8',
    );

    // Begin with a valid JPEG signature, followed by enough data to exceed
    // Fastify's configured 50 MiB limit.
    const fileContent = Buffer.alloc(fileSize, 0x41);
    fileContent.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

    const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const payload = Buffer.concat([header, fileContent, footer]);

    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload,
    });

    expect(response.statusCode).toBe(413);
    expect(createIncidentAttachment).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});


  it('rejects a file with invalid content declared as JPEG', async () => {
  vi.mocked(findIncidentById).mockResolvedValueOnce({
    id: INCIDENT_ID,
  } as never);

  vi.mocked(storeIncidentFile).mockRejectedValueOnce(
    new InvalidFileSignatureError(),
  );

  const app = buildApp();

  try {
    const boundary = 'invalid-content-boundary';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="fake.jpg"',
      'Content-Type: image/jpeg',
      '',
      'This is plain text, not a JPEG image.',
      `--${boundary}--`,
      '',
    ].join('\r\n');

    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(response.statusCode).toBe(415);
    expect(storeIncidentFile).toHaveBeenCalledOnce();
    expect(createIncidentAttachment).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});


  it('returns 400 when no file is provided', async () => {
    const app = buildApp();

    try {
        const boundary = 'test-boundary';

        const response = await app.inject({
          method: 'POST',
          url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
          headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
          },
          payload:
            `--${boundary}\r\n` +
            'Content-Disposition: form-data; name="description"\r\n\r\n' +
            'No attachment included\r\n' +
            `--${boundary}--\r\n`,
        });
      expect(response.statusCode).toBe(400);
      expect(response.json().message).toContain('No file was provided');
    } finally {
      await app.close();
    }
  });

  it('returns 404 when uploading to a nonexistent incident', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce(null as never);

    const app = buildApp();

    try {
      const boundary = 'missing-incident-boundary';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="images.jpg"',
        'Content-Type: image/jpeg',
        '',
        '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01',
        `--${boundary}--`,
        '',
      ].join('\r\n');

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload: Buffer.from(body, 'binary'),
      });

      expect(response.statusCode).toBe(404);
      expect(storeIncidentFile).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  //INCIDENT GET ATTACHMENT TEST
  const ATTACHMENT_ID = '03b5c993-2bcb-42bd-9bb3-e418999dbabd';

  const OTHER_INCIDENT_ID ='11111111-1111-4111-8111-111111111111';

  const mockAttachment = {
    id: ATTACHMENT_ID,
    incident_id: INCIDENT_ID,
    file_name: 'test-image.png',
    mime_type: 'image/png',
    file_size_bytes: '8641',
    storage_key: 'c8366a4d-931c-4457-b7cb-24e7ce2ab6ae.png',
    uploaded_by: null,
    uploaded_at: new Date(),
  };

  it('retrieves an existing incident attachment', async () => {
    vi.mocked(findIncidentAttachmentById).mockResolvedValueOnce(
      mockAttachment as never,
    );

    // Use the package manifest as a real, readable test file.
    vi.mocked(getStoredIncidentFilePath).mockReturnValueOnce(
      resolve(process.cwd(), 'package.json'),
    );

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments/${ATTACHMENT_ID}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('image/png');
      expect(response.headers['content-disposition']).toContain('inline');
      expect(response.body.length).toBeGreaterThan(0);

      expect(findIncidentAttachmentById).toHaveBeenCalledWith(
        ATTACHMENT_ID,
      );
    } finally {
      await app.close();
    }
  });

  it('returns 404 when the attachment does not exist', async () => {
    vi.mocked(findIncidentAttachmentById).mockResolvedValueOnce(
      null as never,
    );

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments/${ATTACHMENT_ID}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toBe(
        'Incident attachment not found',
      );
    } finally {
      await app.close();
    }
  });

  it('returns 404 when the attachment belongs to another incident', async () => {
    vi.mocked(findIncidentAttachmentById).mockResolvedValueOnce(
      mockAttachment as never,
    );

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${OTHER_INCIDENT_ID}/attachments/${ATTACHMENT_ID}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toBe(
        'Incident attachment not found',
      );

      // The service must reject the mismatch before resolving a file path.
      expect(getStoredIncidentFilePath).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('returns 404 when the attachment file is missing from disk', async () => {
    vi.mocked(findIncidentAttachmentById).mockResolvedValueOnce(
      mockAttachment as never,
    );

    vi.mocked(getStoredIncidentFilePath).mockReturnValueOnce(
      resolve(process.cwd(), 'missing-test-attachment.png'),
    );

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments/${ATTACHMENT_ID}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toBe(
        'The stored attachment file is missing',
      );
    } finally {
      await app.close();
    }
  });
 

  //INCIDENT GET ATTACHMENT LIST TEST
  const attachment = {
    id: '03b5c993-2bcb-42bd-9bb3-e418999dbabd',
    incident_id: INCIDENT_ID,
    file_name: 'test1.png',
    mime_type: 'image/png',
    file_size_bytes: '8641',
    storage_key: 'c8366a4d-931c-4457-b7cb-24e7ce2ab6ae.png',
    uploaded_by: null,
    uploaded_at: new Date(),
  };

  it('lists attachments for an existing incident', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce({
      id: INCIDENT_ID,
    } as never);

    vi.mocked(listIncidentAttachmentsByIncidentId)
      .mockResolvedValueOnce([attachment] as never);

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().count).toBe(1);
      expect(response.json().attachments).toHaveLength(1);
      expect(response.json().attachments[0].file_name).toBe(
        'test1.png',
      );
      expect(response.json().attachments[0].storage_key).toBeUndefined();

      expect(listIncidentAttachmentsByIncidentId)
        .toHaveBeenCalledWith(INCIDENT_ID);
    } finally {
      await app.close();
    }
  });

  it('returns 404 when the incident does not exist', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce(null as never);

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().message).toBe('Incident not found');

      expect(listIncidentAttachmentsByIncidentId)
        .not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('returns an empty list when the incident has no attachments', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce({
      id: INCIDENT_ID,
    } as never);

    vi.mocked(listIncidentAttachmentsByIncidentId)
      .mockResolvedValueOnce([] as never);

    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${INCIDENT_ID}/attachments`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().count).toBe(0);
      expect(response.json().attachments).toEqual([]);
    } finally {
      await app.close();
    }
  });
  
});
