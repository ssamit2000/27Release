export const RELEASE_STEPS = [
  "Code Freeze",
  "Run Automated Tests",
  "QA Approval",
  "Security Review",
  "Deploy to Staging",
  "Smoke Test",
  "Deploy to Production",
  "Post Release Monitoring",
] as const;

export type ReleaseStep = (typeof RELEASE_STEPS)[number];

export function isValidReleaseStep(step: string): step is ReleaseStep {
  return (RELEASE_STEPS as readonly string[]).includes(step);
}
