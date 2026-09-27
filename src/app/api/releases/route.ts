import { NextResponse } from "next/server";
import { handleApiError, parseJson } from "@/lib/api";
import { createRelease, listReleases } from "@/lib/releases";
import { createReleaseSchema } from "@/lib/validation";

export async function GET() {
  try {
    return NextResponse.json({ releases: await listReleases() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createReleaseSchema.parse(await parseJson(request));
    return NextResponse.json({ release: await createRelease(input) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
