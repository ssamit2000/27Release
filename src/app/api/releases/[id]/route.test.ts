/** @jest-environment node */
import { DELETE, GET, PATCH } from "@/app/api/releases/[id]/route";
import { deleteRelease, getRelease, updateRelease } from "@/lib/releases";
import { Prisma } from "@prisma/client";

jest.mock("@/lib/releases", () => ({ deleteRelease: jest.fn(), getRelease: jest.fn(), updateRelease: jest.fn() }));
const context = { params: Promise.resolve({ id: "rel_1" }) };
const record = { id: "rel_1", name: "v1", date: new Date("2026-09-30"), additionalInfo: "", completedSteps: [], createdAt: new Date(), updatedAt: new Date() };

describe("release item API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns an existing release and reports missing ids", async () => {
    jest.mocked(getRelease).mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    expect((await GET(new Request("http://localhost"), context)).status).toBe(200);
    const missing = await GET(new Request("http://localhost"), context);
    expect(missing.status).toBe(404);
    expect((await missing.json()).error.message).toBe("Release not found.");
  });

  it("updates valid fields and rejects unknown steps", async () => {
    jest.mocked(updateRelease).mockResolvedValue(record);
    const valid = await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ completedSteps: ["QA Approval"] }) }), context);
    expect(valid.status).toBe(200);
    const invalid = await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ completedSteps: ["Arbitrary step"] }) }), context);
    expect(invalid.status).toBe(400);
    expect(updateRelease).toHaveBeenCalledTimes(1);
  });

  it("returns 404 when an update or deletion targets a missing release", async () => {
    const missing = () => new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "test" });
    jest.mocked(updateRelease).mockRejectedValueOnce(missing());
    jest.mocked(deleteRelease).mockRejectedValueOnce(missing());
    const update = await PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ additionalInfo: "Note" }) }), context);
    const deletion = await DELETE(new Request("http://localhost", { method: "DELETE" }), context);
    expect(update.status).toBe(404);
    expect(deletion.status).toBe(404);
    expect((await update.json()).error.message).toBe("Release not found.");
  });

  it("deletes an existing release", async () => {
    jest.mocked(deleteRelease).mockResolvedValue(record);
    expect((await DELETE(new Request("http://localhost", { method: "DELETE" }), context)).status).toBe(204);
  });
});
