import { prisma } from "@/lib/prisma";
import { CreateReleaseInput, UpdateReleaseInput } from "@/lib/validation";

export async function listReleases() {
  return prisma.release.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
}

export async function createRelease(input: CreateReleaseInput) {
  return prisma.release.create({ data: { ...input, date: new Date(`${input.date}T00:00:00.000Z`) } });
}

export async function getRelease(id: string) {
  return prisma.release.findUnique({ where: { id } });
}

export async function updateRelease(id: string, input: UpdateReleaseInput) {
  return prisma.release.update({ where: { id }, data: input });
}

export async function deleteRelease(id: string) {
  return prisma.release.delete({ where: { id } });
}
