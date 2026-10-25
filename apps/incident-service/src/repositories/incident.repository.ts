// createIncident() inserts an incident and returns the saved database record.
// listIncidents() retrieves records with optional status and priority filters.
// pool.query() is used only in this repository for these incident operations.

import { pool } from '../config/database.js';
import type { PoolClient } from 'pg';
import type {
  CreateIncidentBody,
  ListIncidentsQuery,
} from '../types/incident.types.js';


//Post a incident
// export const createIncident = async (
//   referenceNumber: string,
//   incident: CreateIncidentBody,
// ) => {
//   const result = await pool.query(
//     `INSERT INTO incidents (
//       reference_number,
//       type,
//       description,
//       latitude,
//       longitude,
//       address,
//       reported_by,
//       people_affected,
//       additional_information
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//     RETURNING
//       id,
//       reference_number,
//       type,
//       description,
//       priority,
//       status,
//       latitude,
//       longitude,
//       address,
//       reported_by,
//       people_affected,
//       additional_information,
//       created_at,
//       updated_at`,
//     [
//       referenceNumber,
//       incident.type,
//       incident.description.trim(),
//       incident.latitude ?? null,
//       incident.longitude ?? null,
//       incident.address ?? null,
//       incident.reportedBy ?? null,
//       incident.peopleAffected ?? 1,
//       incident.additionalInformation?.trim() || null,
//     ],
//   );

//   return result.rows[0];
// };


//Every newly created incident receives an initial history entry, typically NULL → REPORTED
export const createIncident = async (
  referenceNumber: string,
  incident: CreateIncidentBody,
) => {
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO incidents (
        reference_number,
        type,
        description,
        priority,
        latitude,
        longitude,
        address,
        reported_by,
        people_affected,
        additional_information
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        reference_number,
        type,
        description,
        priority,
        status,
        latitude,
        longitude,
        address,
        reported_by,
        people_affected,
        additional_information,
        created_at,
        updated_at`,
      [
        referenceNumber,
        incident.type,
        incident.description.trim(),
        incident.priority,
        incident.latitude ?? null,
        incident.longitude ?? null,
        incident.address ?? null,
        incident.reportedBy ?? null,
        incident.peopleAffected ?? 1,
        incident.additionalInformation?.trim() || null,
      ],
    );

    const createdIncident = result.rows[0];

    await client.query(
      `INSERT INTO incident_status_history (
        incident_id,
        previous_status,
        new_status,
        changed_at
      )
      VALUES ($1, $2, $3, $4)`,
      [
        createdIncident.id,
        null,
        createdIncident.status,
        createdIncident.created_at,
      ],
    );

    await client.query('COMMIT');

    return createdIncident;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


//Get all the incidents
export const listIncidents = async (
  query: ListIncidentsQuery,
) => {
  const { status, priority } = query;
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (priority) {
    values.push(priority);
    conditions.push(`priority = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM incidents
     ${whereClause}`,
    values,
  );

  const total = Number(countResult.rows[0].total);

  const result = await pool.query(
    `SELECT
       id,
       reference_number,
       type,
       description,
       priority,
       status,
       latitude,
       longitude,
       address,
       reported_by,
       people_affected,
       additional_information,
       created_at,
       updated_at
     FROM incidents
     ${whereClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  return {
    data: result.rows,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + result.rows.length < total,
    },
  };
};


//Get specefic incident
export const findIncidentById = async (id: string) => {
  const result = await pool.query(
    `SELECT
       id,
       reference_number,
       type,
       description,
       priority,
       status,
       latitude,
       longitude,
       address,
       reported_by,
       people_affected,
       additional_information,
       created_at,
       updated_at
     FROM incidents
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

//Find incident by reference number

export const findIncidentByReferenceNumber = async (
  referenceNumber: string,
) => {
  const result = await pool.query(
    `SELECT
       id,
       reference_number,
       type,
       description,
       priority,
       status,
       latitude,
       longitude,
       address,
       reported_by,
       people_affected,
       additional_information,
       created_at,
       updated_at
     FROM incidents
     WHERE reference_number = $1`,
    [referenceNumber.trim().toUpperCase()],
  );
  //Uses $1 parameterisation to prevent SQL injection.
  return result.rows[0] ?? null;
};



//Update Incident Status
// Why expectedStatus? The SQL updates the incident only if its status still matches the status we previously read.
//if two dispatchers try to update the same incident simultaneously, this condition helps prevent the second update from silently overwriting a change made by the first

// export const updateIncidentStatus = async (
//   id: string,
//   expectedStatus: string,
//   newStatus: string,
// ) => {
//   const result = await pool.query(
//     `UPDATE incidents
//      SET status = $3,
//          updated_at = NOW()
//      WHERE id = $1
//        AND status = $2
//      RETURNING
//        id,
//        reference_number,
//        type,
//        description,
//        priority,
//        status,
//        latitude,
//        longitude,
//        address,
//        reported_by,
//        people_affected,
//        additional_information,
//        created_at,
//        updated_at`,
//     [id, expectedStatus, newStatus],
//   );

//   return result.rows[0] ?? null;
// };


//The incident update and history insert happen in the same transaction
export const updateIncidentStatus = async (
  id: string,
  expectedStatus: string,
  newStatus: string,
) => {
  const client: PoolClient = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE incidents
       SET status = $3,
           updated_at = NOW()
       WHERE id = $1
         AND status = $2
       RETURNING
         id,
         reference_number,
         type,
         description,
         priority,
         status,
         latitude,
         longitude,
         address,
         reported_by,
         people_affected,
         additional_information,
         created_at,
         updated_at`,
      [id, expectedStatus, newStatus],
    );

    const incident = result.rows[0] ?? null;

    if (!incident) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query(
      `INSERT INTO incident_status_history (
         incident_id,
         previous_status,
         new_status
       )
       VALUES ($1, $2, $3)`,
      [id, expectedStatus, newStatus],
    );

    await client.query('COMMIT');

    return incident;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const listIncidentStatusHistory = async (
  incidentId: string,
) => {
  const result = await pool.query(
    `SELECT
       id,
       incident_id,
       previous_status,
       new_status,
       changed_at
     FROM incident_status_history
     WHERE incident_id = $1
     ORDER BY changed_at ASC, id ASC`,
    [incidentId],
  );

  return result.rows;
};

