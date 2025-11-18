import { z } from 'zod';

const AllowedFrequencies = z.enum(['daily', 'weekly']);

export const updateReminderSchema = z.object({
  is_subscribed: z.boolean().optional(),
  frequency: AllowedFrequencies.optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: "At least one field (is_subscribed or frequency) must be provided",
});