CREATE TABLE IF NOT EXISTS incident_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    file_size_bytes BIGINT NOT NULL
        CHECK (file_size_bytes > 0),

    storage_key TEXT NOT NULL UNIQUE,

    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT incident_attachments_mime_type_check
        CHECK (
            mime_type IN (
                'image/jpeg',
                'image/png',
                'image/webp',
                'video/mp4'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_attachments_incident_id
    ON incident_attachments (incident_id);
