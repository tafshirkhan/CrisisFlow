import { pool } from '../config/database.js';

import type {
  Assignment,
  CreateAssignmentInput,
  ReassignAssignmentInput,
  ResponderWorkload,
} from '../types/assignment.types.js';


//This function inserts an assignment and returns the newly created database record
export const createAssignment = async (
  input: CreateAssignmentInput,
): Promise<Assignment> => {
  const query = `
    INSERT INTO assignments (
      incident_id,
      responder_id,
      assigned_by
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    input.incidentId,
    input.responderId,
    input.assignedBy,
  ];

  const result = await pool.query<Assignment>(query, values);

  return result.rows[0];
};

//This retrieves one assignment by its ID. It returns null when no matching assignment exists.
export const findAssignmentById = async (
  assignmentId: string,
): Promise<Assignment | null> => {
  const query = `
    SELECT *
    FROM assignments
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await pool.query<Assignment>(query, [assignmentId]);

  return result.rows[0] ?? null;
};

//It returns all assignments for an incident, with the newest assignment first.
export const findAssignmentsByIncidentId = async (
  incidentId: string,
): Promise<Assignment[]> => {
  const query = `
    SELECT *
    FROM assignments
    WHERE incident_id = $1
    ORDER BY assigned_at DESC;
  `;

  const result = await pool.query<Assignment>(query, [incidentId]);

  return result.rows;
};

// Marks an active assignment as completed and records when it was completed.
export const completeAssignment = async (
  assignmentId: string,
): Promise<Assignment | null> => {
  const query = `
    UPDATE assignments
    SET
      status = 'COMPLETED',
      completed_at = NOW()
    WHERE id = $1
      AND status = 'ACTIVE'
    RETURNING *;
  `;

  const result = await pool.query<Assignment>(query, [assignmentId]);

  return result.rows[0] ?? null;
};

// Reassigns an incident and preserving the previous assignment history.
export const reassignAssignment = async (
  input: ReassignAssignmentInput,
): Promise<Assignment | null> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query<Assignment>(
      `
        SELECT *
        FROM assignments
        WHERE id = $1
        FOR UPDATE;
      `,
      [input.assignmentId],
    );

    const currentAssignment = currentResult.rows[0];

    if (!currentAssignment || currentAssignment.status !== 'ACTIVE') {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query(
      `
        UPDATE assignments
        SET status = 'REASSIGNED'
        WHERE id = $1;
      `,
      [input.assignmentId],
    );

    const newAssignmentResult = await client.query<Assignment>(
      `
        INSERT INTO assignments (
          incident_id,
          responder_id,
          assigned_by
        )
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [
        currentAssignment.incident_id,
        input.newResponderId,
        input.reassignedBy,
      ],
    );

    await client.query('COMMIT');

    return newAssignmentResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

//Returns responders who currently have active assignments
export const findResponderWorkload = async (): Promise<
  ResponderWorkload[]
> => {
  const query = `
    SELECT
      responder_id,
      COUNT(*)::INT AS active_assignments
    FROM assignments
    WHERE status = 'ACTIVE'
    GROUP BY responder_id
    ORDER BY active_assignments ASC, responder_id ASC;
  `;
  const result = await pool.query<ResponderWorkload>(query);
  return result.rows;
};