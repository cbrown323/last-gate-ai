import { prisma } from "@/lib/db";
import {
  fetchRepoFile,
  fetchRepoTreePaths,
} from "@/lib/github/fetch-repo-file";
import type { DependencyEntry, StackScanResult } from "@/types";

const MANIFEST_FILES = [
  "package.json",
  "go.mod",
  "Cargo.toml",
  "requirements.txt",
  "pyproject.toml",
  "Gemfile",
  "composer.json",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
] as const;

const LOCKFILES = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "go.sum",
  "Cargo.lock",
  "poetry.lock",
  "Gemfile.lock",
  "composer.lock",
] as const;

const FRAMEWORK_RULES: { pattern: RegExp | string; label: string }[] = [
  { pattern: "next", label: "Next.js" },
  { pattern: "nuxt", label: "Nuxt" },
  { pattern: "remix", label: "Remix" },
  { pattern: "@angular/core", label: "Angular" },
  { pattern: "vue", label: "Vue" },
  { pattern: "react", label: "React" },
  { pattern: "svelte", label: "Svelte" },
  { pattern: "express", label: "Express" },
  { pattern: "fastify", label: "Fastify" },
  { pattern: "hono", label: "Hono" },
  { pattern: "@nestjs/core", label: "NestJS" },
  { pattern: "django", label: "Django" },
  { pattern: "flask", label: "Flask" },
  { pattern: "fastapi", label: "FastAPI" },
  { pattern: "rails", label: "Ruby on Rails" },
  { pattern: "laravel/framework", label: "Laravel" },
  { pattern: "spring-boot", label: "Spring Boot" },
  { pattern: "prisma", label: "Prisma" },
  { pattern: "drizzle-orm", label: "Drizzle" },
  { pattern: "tailwindcss", label: "Tailwind CSS" },
  { pattern: "@prisma/client", label: "Prisma" },
];

function parsePackageJson(content: string): {
  dependencies: DependencyEntry[];
  frameworks: string[];
} {
  const dependencies: DependencyEntry[] = [];
  const frameworks: string[] = [];
  try {
    const pkg = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
      dependencies.push({ name, version, dev: false });
    }
    for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
      dependencies.push({ name, version, dev: true });
    }
    const allNames = dependencies.map((d) => d.name);
    for (const rule of FRAMEWORK_RULES) {
      const match =
        typeof rule.pattern === "string"
          ? allNames.includes(rule.pattern)
          : allNames.some((n) => (rule.pattern as RegExp).test(n));
      if (match && !frameworks.includes(rule.label)) {
        frameworks.push(rule.label);
      }
    }
  } catch {
    // ignore parse errors
  }
  return { dependencies, frameworks };
}

function detectLanguages(paths: string[], manifestFiles: string[]): string[] {
  const langs = new Set<string>();
  const extMap: Record<string, string> = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".java": "Java",
    ".kt": "Kotlin",
    ".cs": "C#",
    ".swift": "Swift",
  };
  for (const p of paths) {
    const ext = p.slice(p.lastIndexOf("."));
    if (extMap[ext]) langs.add(extMap[ext]);
  }
  if (manifestFiles.includes("go.mod")) langs.add("Go");
  if (manifestFiles.includes("Cargo.toml")) langs.add("Rust");
  if (
    manifestFiles.includes("requirements.txt") ||
    manifestFiles.includes("pyproject.toml")
  ) {
    langs.add("Python");
  }
  if (manifestFiles.includes("Gemfile")) langs.add("Ruby");
  if (manifestFiles.includes("composer.json")) langs.add("PHP");
  if (manifestFiles.includes("pom.xml") || manifestFiles.includes("build.gradle")) {
    langs.add("Java");
  }
  if (manifestFiles.includes("package.json")) {
    langs.add("JavaScript");
    if (paths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"))) {
      langs.add("TypeScript");
    }
  }
  return [...langs].sort();
}

export async function scanApplicationStack(
  applicationId: string
): Promise<StackScanResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { gitMeta: true },
  });

  if (!application?.repoUrl) {
    throw new Error("Application has no repository URL");
  }

  const ref = application.gitMeta?.defaultBranch ?? undefined;
  const foundManifests: string[] = [];
  let allDependencies: DependencyEntry[] = [];
  const frameworks = new Set<string>();

  for (const file of MANIFEST_FILES) {
    const content = await fetchRepoFile(application.repoUrl, file, ref);
    if (!content) continue;
    foundManifests.push(file);
    if (file === "package.json") {
      const parsed = parsePackageJson(content);
      allDependencies = parsed.dependencies;
      parsed.frameworks.forEach((f) => frameworks.add(f));
    }
    if (file === "go.mod" && content.includes("module ")) {
      frameworks.add("Go modules");
    }
    if (file === "pyproject.toml" && content.includes("[tool.django]")) {
      frameworks.add("Django");
    }
  }

  let lockfilePresent = false;
  for (const lock of LOCKFILES) {
    const content = await fetchRepoFile(application.repoUrl, lock, ref);
    if (content) {
      lockfilePresent = true;
      foundManifests.push(lock);
      break;
    }
  }

  const treePaths = await fetchRepoTreePaths(application.repoUrl, ref);
  if (treePaths.some((p) => p.includes("prisma/schema.prisma"))) {
    frameworks.add("Prisma");
  }
  if (treePaths.some((p) => p.startsWith("app/api/") || p.includes("/api/"))) {
    frameworks.add("API routes");
  }
  if (treePaths.some((p) => p === "docker-compose.yml" || p === "Dockerfile")) {
    frameworks.add("Docker");
  }

  const languages = detectLanguages(treePaths, foundManifests);

  const scan = await prisma.stackScan.upsert({
    where: { applicationId },
    create: {
      applicationId,
      frameworks: JSON.parse(JSON.stringify([...frameworks])),
      languages: JSON.parse(JSON.stringify(languages)),
      dependencies: JSON.parse(JSON.stringify(allDependencies.slice(0, 50))),
      manifestFiles: JSON.parse(JSON.stringify(foundManifests)),
      lockfilePresent,
    },
    update: {
      frameworks: JSON.parse(JSON.stringify([...frameworks])),
      languages: JSON.parse(JSON.stringify(languages)),
      dependencies: JSON.parse(JSON.stringify(allDependencies.slice(0, 50))),
      manifestFiles: JSON.parse(JSON.stringify(foundManifests)),
      lockfilePresent,
      scannedAt: new Date(),
    },
  });

  return {
    id: scan.id,
    applicationId: scan.applicationId,
    frameworks: scan.frameworks as unknown as string[],
    languages: scan.languages as unknown as string[],
    dependencies: scan.dependencies as unknown as DependencyEntry[],
    manifestFiles: scan.manifestFiles as unknown as string[],
    lockfilePresent: scan.lockfilePresent,
    scannedAt: scan.scannedAt.toISOString(),
  };
}
