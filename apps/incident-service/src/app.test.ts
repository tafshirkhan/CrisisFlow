
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from './app.js';
import { createIncident, updateIncidentStatus, findIncidentById } from './repositories/incident.repository.js';
import { InvalidStatusTransitionError,} from './services/incident.service.js';

vi.mock('./repositories/incident.repository.js', () => ({
  createIncident: vi.fn(),
  listIncidents: vi.fn(),
  findIncidentById: vi.fn(),
  updateIncidentStatus: vi.fn(),
}));

describe('CrisisFlow API', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
    console.log('Cancellation response:', response.statusCode, response.body);
    
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

  vi.mocked(updateIncidentStatus).mockRejectedValueOnce(
    new InvalidStatusTransitionError(
      'UNDER_REVIEW',
      'CANCELLED',
    ),
  );
  const app = buildApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${INCIDENT_ID}/cancel`,
    });
    console.log('Invalid cancellation response:', response.statusCode, response.body);

    expect(response.statusCode).toBe(422);
    expect(response.json().currentStatus).toBe('UNDER_REVIEW');
    expect(response.json().requestedStatus).toBe('CANCELLED');
  } finally {
    await app.close();
  }
});


});
