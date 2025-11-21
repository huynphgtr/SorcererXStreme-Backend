import { z } from 'zod';

const GenderEnum = z.enum(['male', 'female', 'other']);

export const createPartnerSchema = z.object({
  name: z.string('Name is required').min(1),
  gender: GenderEnum.optional(), 
  birth_date: z.string('Birth date is required').datetime(),
  birth_time: z.string('Birth time is required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'),
  birth_place: z.string('Birth place is required').min(1),
  relationship_type: z.string().optional(), 
});

export const updatePartnerSchema = z.object({
  name: z.string().min(1).optional(),
  gender: GenderEnum.optional(),
  birth_date: z.string().datetime().optional(),
  birth_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM').optional(),
  birth_place: z.string().min(1).optional(),
  relationship_type: z.string().optional(),
}).strict(); 