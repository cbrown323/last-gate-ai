import { prisma } from "@/lib/db";
import { fetchRepoFile } from "@/lib/github/fetch-repo-file";
import type { DeploymentRecord } from "@/types";

const PLATFORM_FILES: { file: string; platform: string }[] = [
  { file: "vercel.json", platform: "vercel" },
  { file: "railway.toml", platform: "railway" },
  { file: "fly.toml", platform: "fly" },
  { file: "render.yaml", platform: "render" },
  { file: "netlify.toml", platform: "netlify" },
  { file: "Dockerfile", platform: "docker" },
];

export async function detectDeployments(
  applicationId: string
): Promise<DeploymentRecord[]> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { gitMeta: true, deployments: { orderBy: { deployedAt: "desc" } } },
  });

  if (!application?.repoUrl) {
    throw new Error("Application has no repository URL");
  }

  const ref = application.gitMeta?.defaultBranch ?? undefined;
  const detected: string[] = [];

  for (const { file, platform } of PLATFORM_FILES) {
    const content = await fetchRepoFile(application.repoUrl, file, ref);
    if (!content) continue;
    detected.push(platform);

    const existing = application.deployments.find(
      (d) => d.platform === platform && d.status === "detected"
    );
    if (!existing) {
      await prisma.deployment.create({
        data: {
          applicationId,
          platform,
          status: "detected",
          url: application.websiteUrl,
          notes: `Auto-detected from ${file}`,
        },
      });
    }
  }

  const updated = await prisma.deployment.findMany({
    where: { applicationId },
    orderBy: { deployedAt: "desc" },
  });

  return updated.map(serializeDeployment);
}

export async function listDeployments(
  applicationId: string
): Promise<DeploymentRecord[]> {
  const deployments = await prisma.deployment.findMany({
    where: { applicationId },
    orderBy: { deployedAt: "desc" },
  });
  return deployments.map(serializeDeployment);
}

export async function createDeployment(
  applicationId: string,
  data: {
    platform: string;
    status?: string;
    url?: string;
    version?: string;
    notes?: string;
  }
): Promise<DeploymentRecord> {
  const deployment = await prisma.deployment.create({
    data: {
      applicationId,
      platform: data.platform,
      status: data.status ?? "success",
      url: data.url,
      version: data.version,
      notes: data.notes,
    },
  });
  return serializeDeployment(deployment);
}

function serializeDeployment(d: {
  id: string;
  applicationId: string;
  platform: string;
  status: string;
  url: string | null;
  version: string | null;
  notes: string | null;
  deployedAt: Date;
}): DeploymentRecord {
  return {
    id: d.id,
    applicationId: d.applicationId,
    platform: d.platform,
    status: d.status,
    url: d.url,
    version: d.version,
    notes: d.notes,
    deployedAt: d.deployedAt.toISOString(),
  };
}
