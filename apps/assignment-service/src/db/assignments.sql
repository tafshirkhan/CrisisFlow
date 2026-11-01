CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL,
    responder_id UUID NOT NULL,
    assigned_by UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT assignments_status_valid
        CHECK (
            status IN (
                'ACTIVE',
                'COMPLETED',
                'CANCELLED',
                'REASSIGNED'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_assignments_incident_id
    ON assignments(incident_id);

CREATE INDEX IF NOT EXISTS idx_assignments_responder_id
    ON assignments(responder_id);

CREATE INDEX IF NOT EXISTS idx_assignments_status
    ON assignments(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_one_active_per_incident
    ON assignments(incident_id)
    WHERE status = 'ACTIVE';