import { getReleaseProgress, getReleaseStatus } from "@/lib/release-status";
import { RELEASE_STEPS, isValidReleaseStep } from "@/lib/steps";

describe("release status and checklist rules", () => {
  it("derives planned, ongoing, and completed states from checklist progress", () => {
    expect(getReleaseStatus([])).toBe("PLANNED");
    expect(getReleaseStatus([RELEASE_STEPS[0]])).toBe("ONGOING");
    expect(getReleaseStatus(RELEASE_STEPS.slice(0, 7))).toBe("ONGOING");
    expect(getReleaseStatus(RELEASE_STEPS)).toBe("COMPLETED");
  });

  it("calculates progress and validates canonical steps", () => {
    expect(getReleaseProgress(RELEASE_STEPS.slice(0, 6))).toEqual({ completed: 6, total: 8, percentage: 75 });
    expect(isValidReleaseStep("QA Approval")).toBe(true);
    expect(isValidReleaseStep("Ship whenever")).toBe(false);
  });
});
