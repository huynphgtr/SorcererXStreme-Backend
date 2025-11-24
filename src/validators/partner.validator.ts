import { z } from 'zod';

const GenderEnum = z.enum(['male', 'female', 'other']);

export const setPartnerSchema = z.object({
  partner_name: z
    .string({ error: 'Partner name is required' })
    .min(1, 'Partner name cannot be empty'),

  partner_gender: GenderEnum.optional(), // Giữ lại optional cho gender

  partner_birth_date: z
    .string({ error: 'Partner birth date is required' })
    .datetime('Invalid date format. Use ISO 8601 format'),

  partner_birth_time: z
    .string({ error: 'Partner birth time is required' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'),

  partner_birth_place: z
    .string({ error: 'Partner birth place is required' })
    .min(1, 'Partner birth place cannot be empty'),
});