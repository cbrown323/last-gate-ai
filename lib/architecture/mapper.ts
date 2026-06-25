import { prisma } from "@/lib/db";
import { fetchRepoTreePaths } from "@/lib/github/fetch-repo-file";
import type { ArchitectureDirectory, ArchitectureLayer, ArchitectureMapResult } from "@/types";

const DIRECTORY_ROLES: { pattern: RegExp; role: string; layer: string }[] = [
  { pattern: /^app\/api\//, role: "API routes", layer: "Backend" },
  { pattern: /^app\//, role: "App Router pages", layer: "Frontend" },
  { pattern: /^pages\/api\//, role: "Pages API", layer: "Backend" },
  { pattern: /^pages\//, role: "Pages router", layer: "Frontend" },
  { pattern: /^components\//, role: "UI components", layer: "Frontend" },
  { pattern: /^lib\//, role: "Shared libraries", layer: "Core" },
  { pattern: /^src\//, role: "Source tree", layer: "Core" },
  { pattern: /^prisma\//, role: "Database schema", layer: "Data" },
  { pattern: /^public\//, role: "Static assets", layer: "Frontend" },
  { pattern: /^server\//, role: "Server logic", layer: "Backend" },
  { pattern: /^api\//, role: "API handlers", layer: "Backend" },
  { pattern: /^tests?\//, role: "Tests", layer: "Quality" },
  { pattern: /^\.github\//, role: "CI/CD workflows", layer: "Infrastructure" },
  { pattern: /^docker/, role: "Container config", layer: "Infrastructure" },
];

function classifyDirectories(paths: string[]): ArchitectureDirectory[] {
  const topDirs = new Set<string>();
  for (const p of paths) {
    const segment = p.split("/")[0];
    if (segment && !segment.startsWith(".")) {
      topDirs.add(segment);
    }
  }

  const directories: ArchitectureDirectory[] = [];
  for (const dir of [...topDirs].sort()) {
    const pathsInDir = paths.filter((p) => p.startsWith(`${dir}/`) || p === dir);
    const rule = DIRECTORY_ROLES.find((r) =>
      pathsInDir.some((p) => r.pattern.test(p))
    );
    directories.push({
      path: dir,
      role: rule?.role ?? "Project directory",
      layer: rule?.layer ?? "Core",
      fileCount: pathsInDir.length,
    });
  }
  return directories;
}

function buildLayers(
  directories: ArchitectureDirectory[],
  frameworks: string[]
): ArchitectureLayer[] {
  const layerMap = new Map<string, Set<string>>();

  for (const dir of directories) {
    if (!layerMap.has(dir.layer)) layerMap.set(dir.layer, new Set());
    layerMap.get(dir.layer)!.add(dir.role);
  }

  if (frameworks.includes("Prisma")) {
    if (!layerMap.has("Data")) layerMap.set("Data", new Set());
    layerMap.get("Data")!.add("Prisma ORM");
  }
  if (frameworks.includes("Next.js")) {
    if (!layerMap.has("Frontend")) layerMap.set("Frontend", new Set());
    layerMap.get("Frontend")!.add("Next.js App Router");
  }

  return [...layerMap.entries()]
    .map(([name, components]) => ({
      name,
      components: [...components].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildMermaidDiagram(layers: ArchitectureLayer[]): string {
  const lines = ["graph TB"];
  let idx = 0;
  const nodeIds = new Map<string, string>();

  for (const layer of layers) {
    const layerId = `L${idx++}`;
    lines.push(`  ${layerId}["${layer.name}"]`);
    for (const comp of layer.components) {
      const compId = `N${idx++}`;
      nodeIds.set(comp, compId);
      lines.push(`  ${compId}("${comp}")`);
      lines.push(`  ${layerId} --> ${compId}`);
    }
  }

  if (layers.length === 0) {
    lines.push('  empty["No structure detected — run stack scan first"]');
  }

  return lines.join("\n");
}

export async function mapApplicationArchitecture(
  applicationId: string
): Promise<ArchitectureMapResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { stackScan: true, gitMeta: true },
  });

  if (!application?.repoUrl) {
    throw new Error("Application has no repository URL");
  }

  const ref = application.gitMeta?.defaultBranch ?? undefined;
  const paths = await fetchRepoTreePaths(application.repoUrl, ref);
  const directories = classifyDirectories(paths);
  const frameworks = (application.stackScan?.frameworks as string[]) ?? [];
  const layers = buildLayers(directories, frameworks);
  const diagram = buildMermaidDiagram(layers);

  const arch = await prisma.architectureMap.upsert({
    where: { applicationId },
    create: {
      applicationId,
      layers: JSON.parse(JSON.stringify(layers)),
      directories: JSON.parse(JSON.stringify(directories)),
      diagram,
    },
    update: {
      layers: JSON.parse(JSON.stringify(layers)),
      directories: JSON.parse(JSON.stringify(directories)),
      diagram,
      mappedAt: new Date(),
    },
  });

  return {
    id: arch.id,
    applicationId: arch.applicationId,
    layers: arch.layers as unknown as ArchitectureLayer[],
    directories: arch.directories as unknown as ArchitectureDirectory[],
    diagram: arch.diagram,
    mappedAt: arch.mappedAt.toISOString(),
  };
}
