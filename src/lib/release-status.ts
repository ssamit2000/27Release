import { RELEASE_STEPS } from "@/lib/steps";

export type ReleaseStatus = "PLANNED" | "ONGOING" | "COMPLETED";

export function getReleaseStatus(completedSteps: readonly string[]): ReleaseStatus {
  if (completedSteps.length === 0) return "PLANNED";
  if (completedSteps.length === RELEASE_STEPS.length) return "COMPLETED";
  return "ONGOING";
}

export function getReleaseProgress(completedSteps: readonly string[]) {
  return {
    completed: completedSteps.length,
    total: RELEASE_STEPS.length,
    percentage: Math.round((completedSteps.length / RELEASE_STEPS.length) * 100),
  };
}
