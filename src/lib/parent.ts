import { prisma } from "@/lib/prisma";

export async function getParentChildIds(parentId: string): Promise<string[]> {
  const links = await prisma.parentChild.findMany({
    where: { parentId },
    select: { childId: true },
  });
  return links.map((l) => l.childId);
}

export async function getParentChildren(parentId: string) {
  const links = await prisma.parentChild.findMany({
    where: { parentId },
    include: { child: true },
    orderBy: { child: { firstName: "asc" } },
  });
  return links.map((l) => l.child);
}

/** Throws (via null return) if the child does not belong to this parent — call sites should redirect/404. */
export async function assertParentOwnsChild(parentId: string, childId: string) {
  const link = await prisma.parentChild.findUnique({
    where: { parentId_childId: { parentId, childId } },
  });
  return !!link;
}
