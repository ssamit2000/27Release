/** @jest-environment node */
import { GET, POST } from "@/app/api/releases/route";
import { createRelease, listReleases } from "@/lib/releases";

jest.mock("@/lib/releases", () => ({ createRelease: jest.fn(), listReleases: jest.fn() }));

const fakeRelease = { id: "rel_1", name: "v2.8.0", date: new Date("2026-09-30"), additionalInfo: "", completedSteps: [], createdAt: new Date(), updatedAt: new Date() };

describe("release collection API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a valid release with 201", async () => {
    jest.mocked(createRelease).mockResolvedValue(fakeRelease);
    const response = await POST(new Request("http://localhost/api/releases", { method: "POST", body: JSON.stringify({ name: "v2.8.0", date: "2026-09-30" }) }));
    expect(response.status).toBe(201);
    expect((await response.json()).release.name).toBe("v2.8.0");
    expect(createRelease).toHaveBeenCalledWith({ name: "v2.8.0", date: "2026-09-30", additionalInfo: "" });
  });

  it.each([
    [{ name: "", date: "2026-09-30" }],
    [{ date: "2026-09-30" }],
    [{ name: "v1", date: "nope" }],
  ])("rejects invalid create payload %j with 400", async (body) => {
    const response = await POST(new Request("http://localhost/api/releases", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.message).toBe("Please check the submitted fields.");
    expect(createRelease).not.toHaveBeenCalled();
  });

  it("lists releases", async () => {
    jest.mocked(listReleases).mockResolvedValue([fakeRelease]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).releases).toHaveLength(1);
  });
});
