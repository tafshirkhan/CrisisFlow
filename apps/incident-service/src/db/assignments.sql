CREATE TABLE IF NOT EXISTS incident_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id) ON DELETE CASCADE,

    responder_id UUID NOT NULL,

    assigned_by UUID NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ,

    CONSTRAINT incident_assignments_status_check
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
    ON incident_assignments(incident_id);

CREATE INDEX IF NOT EXISTS idx_assignments_responder_id
    ON incident_assignments(responder_id);

CREATE INDEX IF NOT EXISTS idx_assignments_status
    ON incident_assignments(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_responder_assignment
    ON incident_assignments(incident_id, responder_id)
    WHERE status = 'ACTIVE';