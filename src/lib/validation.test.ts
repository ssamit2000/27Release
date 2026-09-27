import { createReleaseSchema, updateReleaseSchema } from "@/lib/validation";

describe("release request validation", () => {
  it("trims valid create fields and applies optional defaults", () => {
    expect(createReleaseSchema.parse({ name: " v2.8.0 ", date: "2026-09-30" })).toMatchObject({ name: "v2.8.0", additionalInfo: "" });
  });

  it.each([
    [{ name: "   ", date: "2026-09-30" }],
    [{ name: "v1", date: "2026-02-30" }],
    [{ name: "v1", date: "2026-09-30", extra: true }],
  ])("rejects invalid create payload %j", (payload) => {
    expect(createReleaseSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects unknown and duplicate checklist steps, accepts partial updates", () => {
    expect(updateReleaseSchema.safeParse({ completedSteps: ["unknown"] }).success).toBe(false);
    expect(updateReleaseSchema.safeParse({ completedSteps: ["QA Approval", "QA Approval"] }).success).toBe(false);
    expect(updateReleaseSchema.safeParse({ additionalInfo: "Note" }).success).toBe(true);
    expect(updateReleaseSchema.safeParse({ completedSteps: ["QA Approval"] }).success).toBe(true);
    expect(updateReleaseSchema.safeParse({}).success).toBe(false);
  });
});
