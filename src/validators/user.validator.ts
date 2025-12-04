import { z } from 'zod';

const GenderEnum = z.enum(['male', 'female', 'other']);

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .optional(), 

  gender: GenderEnum.optional(),

  birth_date: z
    .string()
    // .datetime() // Đảm bảo chuỗi là định dạng ISO 8601 (e.g., "2023-10-27T10:00:00.000Z")
    .min(1, 'Birth date is required')
    .optional(),

  birth_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM') // Validate định dạng "HH:MM"
    .optional(),

  birth_place: z
    .string()
    .min(2, 'Birth place must be at least 2 characters long')
    .optional(),

}).strict(); 

export const completeProfileSchema = z.object({
  name: z
    .string('Name is required')
    .min(2, 'Name must be at least 2 characters long'),
  
  gender: GenderEnum,
  
  birth_date: z
    .string('Birth date is required')
    // .datetime('Invalid date format. Use ISO 8601 format'), 
    .min(1, 'Birth date cannot be empty'),

  birth_time: z
    .string('Birth time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'),

  birth_place: z
    .string('Birth place is required')
    .min(2, 'Birth place must be at least 2 characters long'),

}).strict();

