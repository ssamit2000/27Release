import { NextResponse } from "next/server";
import { ApiError, handleApiError, parseJson } from "@/lib/api";
import { deleteRelease, getRelease, updateRelease } from "@/lib/releases";
import { updateReleaseSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const release = await getRelease(id);
    if (!release) throw new ApiError(404, "Release not found.");
    return NextResponse.json({ release });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = updateReleaseSchema.parse(await parseJson(request));
    return NextResponse.json({ release: await updateRelease(id, input) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteRelease(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
