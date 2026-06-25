import { prisma } from "@/lib/db";

const STALE_DAYS = 7;

export async function findStaleApplicationsForRefresh() {
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

  const applications = await prisma.application.findMany({
    where: {
      repoUrl: { not: null },
      status: { not: "archived" },
    },
    include: {
      gitMeta: true,
      securityReports: {
        take: 1,
        orderBy: { generatedAt: "desc" },
      },
    },
  });

  return applications.filter((app) => {
    const gitStale = !app.gitMeta?.syncedAt || app.gitMeta.syncedAt < cutoff;
    const securityStale =
      app.securityReports.length === 0 ||
      app.securityReports[0].generatedAt < cutoff;
    return gitStale || securityStale;
  });
}

export async function findApplicationsWithRepo() {
  return prisma.application.findMany({
    where: {
      repoUrl: { not: null },
      status: { not: "archived" },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, repoUrl: true },
  });
}
