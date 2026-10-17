
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from './app.js';
import { createIncident, updateIncidentStatus, findIncidentById,listIncidents } from './repositories/incident.repository.js';
import { InvalidStatusTransitionError,} from './services/incident.service.js';

vi.mock('./repositories/incident.repository.js', () => ({
  createIncident: vi.fn(),
  listIncidents: vi.fn(),
  findIncidentById: vi.fn(),
  updateIncidentStatus: vi.fn(),
}));

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
    console.log('PATCH response:', response.statusCode, response.body);

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
  } finally {
    await app.close();
  }
});


});
