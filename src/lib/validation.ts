import { z } from "zod";
import { RELEASE_STEPS } from "@/lib/steps";

const trimmedName = z.string().trim().min(1, "Release name is required.").max(80, "Release name must be 80 characters or fewer.");
const additionalInfo = z.string().trim().max(2000, "Additional information must be 2,000 characters or fewer.");
const releaseDate = z.string().trim().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}, "Enter a valid release date.");

export const createReleaseSchema = z.object({
  name: trimmedName,
  date: releaseDate,
  additionalInfo: additionalInfo.optional().default(""),
}).strict();

export const updateReleaseSchema = z.object({
  completedSteps: z.array(z.enum(RELEASE_STEPS)).max(RELEASE_STEPS.length).optional()
    .refine((steps) => !steps || new Set(steps).size === steps.length, "Checklist steps cannot be duplicated."),
  additionalInfo: additionalInfo.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>;
export type UpdateReleaseInput = z.infer<typeof updateReleaseSchema>;
