import type {
  Application,
  ApplicationStatus,
  ArchitectureMapResult,
  CalendarEventRecord,
  CalendarEventType,
  DeploymentRecord,
  Epic,
  GitMetadata,
  HeadroomReportResult,
  LifecyclePhase,
  Note,
  SecurityReportResult,
  StackScanResult,
  Subtask,
  SubtaskStatus,
  Task,
  TaskComment,
  TaskPriority,
  TaskStatus,
  TaskTransition,
  WorkflowType,
} from "@/types";

type PrismaApplication = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  repoUrl: string | null;
  websiteUrl: string | null;
  owner: string | null;
  lifecyclePhase?: string;
  workflowType?: string;
  ticketPrefix?: string | null;
  isPinned?: boolean;
  doingWipLimit?: number;
  lifecyclePhaseStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  gitMeta?: {
    id: string;
    applicationId: string;
    lastCommitAt: Date | null;
    commitCount: number | null;
    commitsLast7Days: number | null;
    commitsLast30Days: number | null;
    contributorCount: number | null;
    openIssues: number | null;
    defaultBranch: string | null;
    syncedAt: Date | null;
  } | null;
  _count?: { tasks: number; epics?: number };
};

export function serializeApplication(app: PrismaApplication): Application {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    status: app.status as ApplicationStatus,
    repoUrl: app.repoUrl,
    websiteUrl: app.websiteUrl,
    owner: app.owner,
    lifecyclePhase: (app.lifecyclePhase ?? "development") as LifecyclePhase,
    workflowType: (app.workflowType ?? "kanban") as WorkflowType,
    ticketPrefix: app.ticketPrefix ?? null,
    isPinned: app.isPinned ?? false,
    doingWipLimit: app.doingWipLimit ?? 3,
    lifecyclePhaseStartedAt: (app.lifecyclePhaseStartedAt ?? app.updatedAt).toISOString(),
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    gitMeta: app.gitMeta
      ? {
          id: app.gitMeta.id,
          applicationId: app.gitMeta.applicationId,
          lastCommitAt: app.gitMeta.lastCommitAt?.toISOString() ?? null,
          commitCount: app.gitMeta.commitCount,
          commitsLast7Days: app.gitMeta.commitsLast7Days,
          commitsLast30Days: app.gitMeta.commitsLast30Days,
          contributorCount: app.gitMeta.contributorCount,
          openIssues: app.gitMeta.openIssues,
          defaultBranch: app.gitMeta.defaultBranch,
          syncedAt: app.gitMeta.syncedAt?.toISOString() ?? null,
        }
      : null,
    _count: app._count,
  };
}

type PrismaTask = {
  id: string;
  applicationId: string;
  epicId: string | null;
  title: string;
  description: string | null;
  status: string;
  position: number;
  priority: string;
  assignee: string | null;
  dueAt: Date | null;
  startAt: Date | null;
  reference: string | null;
  tags: unknown;
  color: string | null;
  code: string | null;
  isClosed: boolean;
  estimationHours: number | null;
  timeSpentHours: number;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: PrismaSubtask[];
  comments?: PrismaTaskComment[];
  epic?: PrismaEpic | null;
};

type PrismaSubtask = {
  id: string;
  taskId: string;
  title: string;
  status: string;
  position: number;
};

type PrismaTaskComment = {
  id: string;
  taskId: string;
  body: string;
  author: string | null;
  createdAt: Date;
};

type PrismaEpic = {
  id: string;
  applicationId: string;
  name: string;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  color: string | null;
  position: number;
  parentId: string | null;
  createdAt: Date;
  _count?: { tasks: number };
};

export function serializeTask(task: PrismaTask): Task {
  return {
    id: task.id,
    applicationId: task.applicationId,
    epicId: task.epicId,
    title: task.title,
    description: task.description,
    status: task.status as TaskStatus,
    position: task.position,
    priority: task.priority as TaskPriority,
    assignee: task.assignee,
    dueAt: task.dueAt?.toISOString() ?? null,
    startAt: task.startAt?.toISOString() ?? null,
    reference: task.reference,
    tags: Array.isArray(task.tags) ? (task.tags as string[]) : [],
    color: task.color,
    code: task.code,
    isClosed: task.isClosed,
    estimationHours: task.estimationHours,
    timeSpentHours: task.timeSpentHours,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    subtasks: task.subtasks?.map(serializeSubtask),
    comments: task.comments?.map(serializeTaskComment),
    epic: task.epic ? serializeEpic(task.epic) : null,
  };
}

export function serializeSubtask(s: PrismaSubtask): Subtask {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    status: s.status as SubtaskStatus,
    position: s.position,
  };
}

export function serializeTaskComment(c: PrismaTaskComment): TaskComment {
  return {
    id: c.id,
    taskId: c.taskId,
    body: c.body,
    author: c.author,
    createdAt: c.createdAt.toISOString(),
  };
}

export function serializeEpic(epic: PrismaEpic): Epic {
  return {
    id: epic.id,
    applicationId: epic.applicationId,
    name: epic.name,
    description: epic.description,
    startsAt: epic.startsAt?.toISOString() ?? null,
    endsAt: epic.endsAt?.toISOString() ?? null,
    color: epic.color,
    position: epic.position,
    parentId: epic.parentId,
    createdAt: epic.createdAt.toISOString(),
    _count: epic._count,
  };
}

type PrismaTransition = {
  id: string;
  taskId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
};

export function serializeTransition(t: PrismaTransition): TaskTransition {
  return {
    id: t.id,
    taskId: t.taskId,
    fromStatus: t.fromStatus,
    toStatus: t.toStatus,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  };
}

export function serializeGitMeta(
  gitMeta: NonNullable<PrismaApplication["gitMeta"]>
): GitMetadata {
  return {
    id: gitMeta.id,
    applicationId: gitMeta.applicationId,
    lastCommitAt: gitMeta.lastCommitAt?.toISOString() ?? null,
    commitCount: gitMeta.commitCount,
    commitsLast7Days: gitMeta.commitsLast7Days,
    commitsLast30Days: gitMeta.commitsLast30Days,
    contributorCount: gitMeta.contributorCount,
    openIssues: gitMeta.openIssues,
    defaultBranch: gitMeta.defaultBranch,
    syncedAt: gitMeta.syncedAt?.toISOString() ?? null,
  };
}

type PrismaStackScan = {
  id: string;
  applicationId: string;
  frameworks: unknown;
  languages: unknown;
  dependencies: unknown;
  manifestFiles: unknown;
  lockfilePresent: boolean;
  scannedAt: Date;
};

export function serializeStackScan(scan: PrismaStackScan): StackScanResult {
  return {
    id: scan.id,
    applicationId: scan.applicationId,
    frameworks: scan.frameworks as string[],
    languages: scan.languages as string[],
    dependencies: scan.dependencies as StackScanResult["dependencies"],
    manifestFiles: scan.manifestFiles as string[],
    lockfilePresent: scan.lockfilePresent,
    scannedAt: scan.scannedAt.toISOString(),
  };
}

type PrismaArchitectureMap = {
  id: string;
  applicationId: string;
  layers: unknown;
  directories: unknown;
  diagram: string;
  mappedAt: Date;
};

export function serializeArchitectureMap(
  arch: PrismaArchitectureMap
): ArchitectureMapResult {
  return {
    id: arch.id,
    applicationId: arch.applicationId,
    layers: arch.layers as ArchitectureMapResult["layers"],
    directories: arch.directories as ArchitectureMapResult["directories"],
    diagram: arch.diagram,
    mappedAt: arch.mappedAt.toISOString(),
  };
}

type PrismaSecurityReport = {
  id: string;
  applicationId: string;
  findings: unknown;
  score: number;
  summary: string;
  mode: string;
  generatedAt: Date;
};

export function serializeSecurityReport(
  report: PrismaSecurityReport
): SecurityReportResult {
  return {
    id: report.id,
    applicationId: report.applicationId,
    findings: report.findings as SecurityReportResult["findings"],
    score: report.score,
    summary: report.summary,
    mode: report.mode as "ai" | "offline" | "demo",
    generatedAt: report.generatedAt.toISOString(),
  };
}

type PrismaHeadroomReport = {
  id: string;
  applicationId: string;
  score: number;
  summary: string;
  recommendations: unknown;
  mode: string;
  generatedAt: Date;
};

export function serializeHeadroomReport(
  report: PrismaHeadroomReport
): HeadroomReportResult {
  return {
    id: report.id,
    applicationId: report.applicationId,
    score: report.score,
    summary: report.summary,
    recommendations: report.recommendations as string[],
    mode: report.mode as "ai" | "offline" | "demo",
    generatedAt: report.generatedAt.toISOString(),
  };
}

type PrismaDeployment = {
  id: string;
  applicationId: string;
  platform: string;
  status: string;
  url: string | null;
  version: string | null;
  notes: string | null;
  deployedAt: Date;
};

export function serializeDeployment(d: PrismaDeployment): DeploymentRecord {
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

type PrismaNote = {
  id: string;
  applicationId: string | null;
  title: string;
  content: string;
  tags: unknown;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  application?: { name: string } | null;
};

export function serializeNote(note: PrismaNote): Note {
  return {
    id: note.id,
    applicationId: note.applicationId,
    applicationName: note.application?.name ?? null,
    title: note.title,
    content: note.content,
    tags: Array.isArray(note.tags) ? (note.tags as string[]) : [],
    isPinned: note.isPinned,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

type PrismaCalendarEvent = {
  id: string;
  applicationId: string | null;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  type: string;
  color: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  application?: { name: string } | null;
};

export function serializeCalendarEvent(
  event: PrismaCalendarEvent
): CalendarEventRecord {
  return {
    id: event.id,
    applicationId: event.applicationId,
    applicationName: event.application?.name ?? null,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    allDay: event.allDay,
    type: event.type as CalendarEventType,
    color: event.color,
    location: event.location,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
