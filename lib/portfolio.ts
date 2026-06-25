import { cache } from "react";
import { prisma } from "@/lib/db";
import { serializeTask } from "@/lib/serialize";
import type {
  PortfolioStats,
  Task,
  TaskPortfolioStats,
  TaskPriority,
  TaskStatus,
  TaskTransitionActivity,
} from "@/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types";

export type PortfolioTask = Task & {
  applicationName: string;
  commentCount: number;
};

export const getPortfolioStats = cache(async (): Promise<PortfolioStats> => {
  const [applications, openTasks, overdueTasks, doingTasks] = await Promise.all([
    getApplications(),
    prisma.task.count({ where: { isClosed: false, status: { not: "done" } } }),
    prisma.task.count({
      where: {
        isClosed: false,
        dueAt: { lt: new Date() },
        status: { not: "done" },
      },
    }),
    prisma.task.count({ where: { status: "doing", isClosed: false } }),
  ]);

  const stats: PortfolioStats = {
    total: applications.length,
    development: 0,
    production: 0,
    archived: 0,
    openIssues: 0,
    needsAttention: 0,
    openTasks,
    overdueTasks,
    doingTasks,
  };

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const app of applications) {
    if (app.status === "development") stats.development++;
    if (app.status === "production") stats.production++;
    if (app.status === "archived") stats.archived++;
    if (app.gitMeta?.openIssues) stats.openIssues += app.gitMeta.openIssues;

    const stale =
      !app.gitMeta?.lastCommitAt ||
      new Date(app.gitMeta.lastCommitAt).getTime() < thirtyDaysAgo;
    const highIssues = (app.gitMeta?.openIssues ?? 0) > 10;
    if (app.status !== "archived" && (stale || highIssues || !app.gitMeta)) {
      stats.needsAttention++;
    }
  }

  return stats;
});

export const getTaskPortfolioStats = cache(async (): Promise<TaskPortfolioStats> => {
  const tasks = await prisma.task.findMany({
    where: { isClosed: false },
    include: { application: { select: { name: true } } },
  });

  const byStatus = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, 0])
  ) as Record<TaskStatus, number>;
  const byPriority = Object.fromEntries(
    TASK_PRIORITIES.map((p) => [p, 0])
  ) as Record<TaskPriority, number>;

  const overdue: TaskPortfolioStats["overdue"] = [];

  for (const task of tasks) {
    byStatus[task.status as TaskStatus] =
      (byStatus[task.status as TaskStatus] ?? 0) + 1;
    byPriority[task.priority as TaskPriority] =
      (byPriority[task.priority as TaskPriority] ?? 0) + 1;

    if (
      task.dueAt &&
      task.dueAt < new Date() &&
      task.status !== "done"
    ) {
      overdue.push({
        id: task.id,
        title: task.title,
        applicationId: task.applicationId,
        applicationName: task.application.name,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        dueAt: task.dueAt.toISOString(),
      });
    }
  }

  const transitions = await prisma.taskTransition.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      task: {
        include: { application: { select: { name: true } } },
      },
    },
  });

  const recentActivity: TaskTransitionActivity[] = transitions.map((t) => ({
    id: t.id,
    taskId: t.taskId,
    taskTitle: t.task.title,
    applicationId: t.task.applicationId,
    applicationName: t.task.application.name,
    fromStatus: t.fromStatus,
    toStatus: t.toStatus,
    createdAt: t.createdAt.toISOString(),
  }));

  return {
    byStatus,
    byPriority,
    recentActivity,
    overdue: overdue.slice(0, 8),
  };
});

export const getApplications = cache(async () => {
  return prisma.application.findMany({
    include: {
      gitMeta: true,
      _count: { select: { tasks: true, epics: true } },
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
});

export const getPinnedApplications = cache(async () => {
  return prisma.application.findMany({
    where: { isPinned: true },
    include: { gitMeta: true, _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
});

export const getPortfolioTasks = cache(async (): Promise<PortfolioTask[]> => {
  const tasks = await prisma.task.findMany({
    where: { isClosed: false },
    include: {
      application: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });

  return tasks.map((task) => ({
    ...serializeTask(task),
    applicationName: task.application.name,
    commentCount: task._count.comments,
  }));
});
