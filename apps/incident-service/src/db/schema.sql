CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(30) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address TEXT,
    reported_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT incidents_type_check CHECK (
        type IN (
            'MEDICAL', 'FIRE', 'ROAD_ACCIDENT', 'PUBLIC_SAFETY',
            'FLOOD', 'HAZARDOUS_MATERIAL', 'MISSING_PERSON',
            'INFRASTRUCTURE_EMERGENCY', 'OTHER'
        )
    ),

    CONSTRAINT incidents_priority_check CHECK (
        priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    ),

    CONSTRAINT incidents_status_check CHECK (
        status IN (
            'REPORTED', 'RECEIVED', 'UNDER_REVIEW', 'VERIFIED',
            'REJECTED', 'PRIORITISED', 'DISPATCHING', 'ASSIGNED',
            'RESOLVED', 'CLOSED', 'CANCELLED', 'DUPLICATE'
        )
    ),

    CONSTRAINT incidents_latitude_check CHECK (
        latitude IS NULL OR latitude BETWEEN -90 AND 90
    ),

    CONSTRAINT incidents_longitude_check CHECK (
        longitude IS NULL OR longitude BETWEEN -180 AND 180
    )
);

CREATE INDEX IF NOT EXISTS idx_incidents_status
    ON incidents (status);

CREATE INDEX IF NOT EXISTS idx_incidents_priority
    ON incidents (priority);

CREATE INDEX IF NOT EXISTS idx_incidents_created_at
    ON incidents (created_at DESC);
