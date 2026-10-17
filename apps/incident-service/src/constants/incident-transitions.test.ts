
import { describe, it, expect } from 'vitest';

import { INCIDENT_STATUS_TRANSITIONS } from './incident-transitions.constants.js';

describe('Incident status transition rules', () => {
  it('allows REPORTED to transition to RECEIVED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.REPORTED).toContain('RECEIVED');
  });

  it('allows REPORTED to transition to CANCELLED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.REPORTED).toContain('CANCELLED');
  });

  it('allows UNDER_REVIEW to transition to VERIFIED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.UNDER_REVIEW).toContain('VERIFIED');
  });

  it('allows VERIFIED to transition to PRIORITISED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.VERIFIED).toContain('PRIORITISED');
  });

  it('does not allow UNDER_REVIEW to transition to CLOSED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.UNDER_REVIEW).not.toContain('CLOSED');
  });

  it('does not allow REPORTED to transition directly to RESOLVED', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.REPORTED).not.toContain('RESOLVED');
  });

  it('does not allow CLOSED incidents to transition to another status', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.CLOSED).toEqual([]);
  });

  it('does not allow CANCELLED incidents to transition to another status', () => {
    expect(INCIDENT_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it('defines transition rules for every incident status', () => {
    expect(Object.keys(INCIDENT_STATUS_TRANSITIONS)).toHaveLength(12);
  });
});
