ALTER TABLE incidents
ADD COLUMN people_affected INTEGER NOT NULL DEFAULT 1;

ALTER TABLE incidents
ADD COLUMN additional_information TEXT;