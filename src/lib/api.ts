import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: { message, ...(details ? { details } : {}) } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Please check the submitted fields.", 400, error.flatten().fieldErrors);
  }
  if (error instanceof ApiError) return jsonError(error.message, error.status);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return jsonError("Release not found.", 404);
  }
  console.error("Release API request failed", error);
  return jsonError("An unexpected error occurred. Please try again.", 500);
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}
