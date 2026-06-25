import { prisma } from "@/lib/db";
import { DEMO_APP_DEFAULTS, DEMO_APP_NAME } from "@/lib/demo/constants";
import {
  demoAiSummary,
  demoArchitectureDiagram,
  demoArchitectureDirectories,
  demoArchitectureLayers,
  demoDeployments,
  demoEpics,
  demoEvents,
  demoGitMeta,
  demoHeadroomRecommendations,
  demoHeadroomSummary,
  demoNotes,
  demoSecurityFindings,
  demoSecuritySummary,
  demoStackScan,
  demoTasks,
} from "@/lib/demo/preview-data";

export async function ensureDemoApplication() {
  const existing = await prisma.application.findFirst({
    where: { name: DEMO_APP_NAME },
  });

  if (existing) return existing;

  return prisma.application.create({
    data: { ...DEMO_APP_DEFAULTS },
  });
}

export async function loadDemoPreview(applicationId?: string) {
  const app = applicationId
    ? await prisma.application.findUnique({ where: { id: applicationId } })
    : await ensureDemoApplication();

  if (!app) {
    throw new Error("Application not found");
  }

  await prisma.application.update({
    where: { id: app.id },
    data: { ...DEMO_APP_DEFAULTS },
  });

  await prisma.gitMetadata.upsert({
    where: { applicationId: app.id },
    create: { applicationId: app.id, ...demoGitMeta },
    update: { ...demoGitMeta },
  });

  await prisma.stackScan.upsert({
    where: { applicationId: app.id },
    create: {
      applicationId: app.id,
      frameworks: demoStackScan.frameworks,
      languages: demoStackScan.languages,
      dependencies: JSON.parse(JSON.stringify(demoStackScan.dependencies)),
      manifestFiles: demoStackScan.manifestFiles,
      lockfilePresent: demoStackScan.lockfilePresent,
      scannedAt: new Date(),
    },
    update: {
      frameworks: demoStackScan.frameworks,
      languages: demoStackScan.languages,
      dependencies: JSON.parse(JSON.stringify(demoStackScan.dependencies)),
      manifestFiles: demoStackScan.manifestFiles,
      lockfilePresent: demoStackScan.lockfilePresent,
      scannedAt: new Date(),
    },
  });

  await prisma.architectureMap.upsert({
    where: { applicationId: app.id },
    create: {
      applicationId: app.id,
      layers: JSON.parse(JSON.stringify(demoArchitectureLayers)),
      directories: JSON.parse(JSON.stringify(demoArchitectureDirectories)),
      diagram: demoArchitectureDiagram,
      mappedAt: new Date(),
    },
    update: {
      layers: JSON.parse(JSON.stringify(demoArchitectureLayers)),
      directories: JSON.parse(JSON.stringify(demoArchitectureDirectories)),
      diagram: demoArchitectureDiagram,
      mappedAt: new Date(),
    },
  });

  await prisma.epic.deleteMany({ where: { applicationId: app.id } });
  const createdEpics = await Promise.all(
    demoEpics.map((e) =>
      prisma.epic.create({
        data: {
          applicationId: app.id,
          name: e.name,
          description: e.description,
          startsAt: e.startsAt,
          endsAt: e.endsAt,
          color: e.color,
          position: e.position,
        },
      })
    )
  );
  const pmEpicId = createdEpics[1]?.id;

  await prisma.task.deleteMany({ where: { applicationId: app.id } });
  for (const t of demoTasks) {
    const task = await prisma.task.create({
      data: {
        applicationId: app.id,
        title: t.title,
        status: t.status,
        position: t.position,
        priority: t.priority ?? "medium",
        code: t.code ?? null,
        tags: t.tags ?? [],
        assignee: t.assignee ?? null,
        dueAt: t.dueAt ?? null,
        estimationHours: t.estimationHours ?? null,
        isClosed: t.isClosed ?? t.status === "done",
        epicId:
          t.title.includes("PM") || t.title.includes("playbook")
            ? pmEpicId
            : null,
      },
    });
    if (t.status === "done") {
      await prisma.taskTransition.create({
        data: {
          taskId: task.id,
          fromStatus: "doing",
          toStatus: "done",
          note: "Completed in demo seed",
        },
      });
    }
  }

  await prisma.aiSummary.deleteMany({ where: { applicationId: app.id } });
  await prisma.aiSummary.create({
    data: { applicationId: app.id, content: demoAiSummary },
  });

  await prisma.securityReport.deleteMany({ where: { applicationId: app.id } });
  await prisma.securityReport.create({
    data: {
      applicationId: app.id,
      findings: JSON.parse(JSON.stringify(demoSecurityFindings)),
      score: 88,
      summary: demoSecuritySummary,
      mode: "demo",
    },
  });

  await prisma.headroomReport.deleteMany({ where: { applicationId: app.id } });
  await prisma.headroomReport.create({
    data: {
      applicationId: app.id,
      score: 78,
      summary: demoHeadroomSummary,
      recommendations: JSON.parse(JSON.stringify(demoHeadroomRecommendations)),
      mode: "demo",
    },
  });

  await prisma.deployment.deleteMany({ where: { applicationId: app.id } });
  await prisma.deployment.createMany({
    data: demoDeployments.map((d) => ({
      applicationId: app.id,
      platform: d.platform,
      status: d.status,
      url: d.url,
      version: d.version,
      notes: d.notes,
      deployedAt: d.deployedAt,
    })),
  });

  await prisma.note.deleteMany({ where: { applicationId: app.id } });
  for (const note of demoNotes) {
    await prisma.note.create({
      data: {
        applicationId: app.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        isPinned: note.isPinned,
      },
    });
  }

  await prisma.calendarEvent.deleteMany({ where: { applicationId: app.id } });
  await prisma.calendarEvent.createMany({
    data: demoEvents.map((e) => ({
      applicationId: app.id,
      title: e.title,
      description: e.description,
      type: e.type,
      startAt: e.startAt,
      allDay: e.allDay,
    })),
  });

  return { applicationId: app.id, name: app.name };
}

export async function getDemoPreviewStatus() {
  const app = await prisma.application.findFirst({
    where: { name: DEMO_APP_NAME },
    include: {
      stackScan: true,
      gitMeta: true,
      summaries: { take: 1 },
    },
  });

  if (!app) {
    return { exists: false, loaded: false, applicationId: null as string | null };
  }

  const loaded = Boolean(app.stackScan && app.gitMeta && app.summaries.length > 0);

  return {
    exists: true,
    loaded,
    applicationId: app.id,
    name: app.name,
  };
}

export function isDemoApplication(name: string) {
  return name === DEMO_APP_NAME;
}
