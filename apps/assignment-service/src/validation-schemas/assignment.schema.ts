import { z } from 'zod';

export const createAssignmentSchema = z.object({
  incidentId: z.string().uuid(),
  responderId: z.string().uuid(),
});

export type CreateAssignmentRequest = z.infer<
  typeof createAssignmentSchema
>;