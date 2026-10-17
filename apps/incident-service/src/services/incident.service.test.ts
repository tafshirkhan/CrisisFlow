
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findIncidentById,
  updateIncidentStatus as updateIncidentStatusRecord,
} from '../repositories/incident.repository.js';

import {
  updateIncidentStatus,
  IncidentNotFoundError,
  InvalidStatusTransitionError,
  IncidentStatusConflictError,
} from './incident.service.js';

import type { IncidentStatus } from '../types/incident.types.js';

vi.mock('../repositories/incident.repository.js', () => ({
  createIncident: vi.fn(),
  listIncidents: vi.fn(),
  findIncidentById: vi.fn(),
  updateIncidentStatus: vi.fn(),
}));

const mockIncident = (status: IncidentStatus) => ({
  id: 'c7d20d5c-da10-42e0-8c10-7e6c48ad3265',
  reference_number: 'CF-TEST12345678',
  type: 'FIRE',
  description: 'Test incident',
  priority: 'MEDIUM',
  status,
  latitude: null,
  longitude: null,
  address: 'Test address',
  reported_by: null,
  created_at: new Date(),
  updated_at: new Date(),
});

describe('updateIncidentStatus service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels an incident in REPORTED status', async () => {
    const incident = mockIncident('REPORTED');
    const cancelledIncident = mockIncident('CANCELLED');

    vi.mocked(findIncidentById).mockResolvedValueOnce(incident as never);
    vi.mocked(updateIncidentStatusRecord).mockResolvedValueOnce(
      cancelledIncident as never,
    );

    const result = await updateIncidentStatus(incident.id, 'CANCELLED');

    expect(result.status).toBe('CANCELLED');
    expect(updateIncidentStatusRecord).toHaveBeenCalledWith(
      incident.id,
      'REPORTED',
      'CANCELLED',
    );
  });

  it('throws IncidentNotFoundError when the incident does not exist', async () => {
    vi.mocked(findIncidentById).mockResolvedValueOnce(null as never);

    await expect(
      updateIncidentStatus('missing-incident-id', 'CANCELLED'),
    ).rejects.toBeInstanceOf(IncidentNotFoundError);

    expect(updateIncidentStatusRecord).not.toHaveBeenCalled();
  });

  it('rejects an invalid status transition', async () => {
    const incident = mockIncident('UNDER_REVIEW');

    vi.mocked(findIncidentById).mockResolvedValueOnce(incident as never);

    await expect(
      updateIncidentStatus(incident.id, 'CLOSED'),
    ).rejects.toThrow(InvalidStatusTransitionError);

    expect(updateIncidentStatusRecord).not.toHaveBeenCalled();
  });

  it('does not update the database when the status is already CANCELLED', async () => {
    const incident = mockIncident('CANCELLED');

    vi.mocked(findIncidentById).mockResolvedValueOnce(incident as never);

    const result = await updateIncidentStatus(incident.id, 'CANCELLED');

    expect(result.status).toBe('CANCELLED');
    expect(updateIncidentStatusRecord).not.toHaveBeenCalled();
  });

  it('throws IncidentStatusConflictError when a concurrent update wins', async () => {
    const incident = mockIncident('REPORTED');

    vi.mocked(findIncidentById).mockResolvedValueOnce(incident as never);
    vi.mocked(updateIncidentStatusRecord).mockResolvedValueOnce(null as never);

    await expect(
      updateIncidentStatus(incident.id, 'CANCELLED'),
    ).rejects.toBeInstanceOf(IncidentStatusConflictError);
  });
});
