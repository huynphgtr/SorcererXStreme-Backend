// src/validators/event.validator.ts
import { z } from 'zod';

const AllowedEventTypes = z.enum([
  'RELATIONSHIP_START', 
  'RELATIONSHIP_END', 
  'MARRIAGE_UNION'
]);

// Schema để người dùng tạo một sự kiện mới
export const createEventSchema = z.object({
  // partner_name: z.string().optional(),
  event_date: z.string( 'Event date is required').datetime(),
  event_type: AllowedEventTypes, // Sử dụng Enum để validate
  details: z.string().optional(),
});

// Schema để người dùng cập nhật một sự kiện
export const updateEventSchema = z.object({
  event_date: z
    .string()
    .datetime()
    .optional(),

  details: z
    .string()
    .optional(),

}).strict()
  .refine(data => Object.keys(data).length > 0, {
    message: "Either 'event_date' or 'details' must be provided for update",
});