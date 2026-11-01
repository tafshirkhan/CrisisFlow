import { z } from 'zod';

export const reassignAssignmentSchema = z.object({
  newResponderId: z.string().uuid(),
});