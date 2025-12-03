import { z } from 'zod';

// const AllowedFrequencies = z.enum(['daily']);

// export const updateReminderSchema = z.object({
//   is_subscribed: z.boolean().optional(),
//   frequency: AllowedFrequencies.optional(),
// }).strict().refine(data => Object.keys(data).length > 0, {
//   message: "At least one field (is_subscribed) must be provided",
// });

export const updateReminderSchema = z.object({
    is_subscribed: z.boolean({
        error: "Trạng thái đăng ký là bắt buộc (true/false)."
    }),
});