import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
});

export const joinTeamSchema = z.object({
  groupId: z.string().length(8, 'Group ID must be exactly 8 characters'),
});

export const requestActionSchema = z.object({
  action: z.enum(['ACCEPTED', 'REJECTED']),
});
