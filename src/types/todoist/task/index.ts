import { z } from "zod";

// Imperfect schema for a task in Todoist
const TaskSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  section_id: z.string().nullable(),
  content: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean(),
  labels: z.array(z.string()),
  parent_id: z.string().nullable(),
  order: z.number(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  due: z.object({
    string: z.string(),
    date: z.string().date(),
    is_recurring: z.boolean(),
    datetime: z.string().datetime({ local: true }).optional(),
    timezone: z.string().optional(),
    lang: z.string(),
  }).nullable(),
  deadline: z.object({
    date: z.string().date(),
    lang: z.string(),
  }).nullable(),
  url: z.string().url(),
  comment_count: z.number().int(),
  created_at: z.string().datetime(),
  creator_id: z.string(),
  assignee_id: z.string().nullable(),
  assigner_id: z.string().nullable(),
  duration: z.object({
    amount: z.number().positive().int(),
    unit: z.enum(["minute", "day"]),
  }).nullable(),
});

type Task = z.infer<typeof TaskSchema>;

export { TaskSchema, type Task };
