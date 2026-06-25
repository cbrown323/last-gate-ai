import { cache } from "react";
import { prisma } from "@/lib/db";
import type { LifecyclePhase } from "@/types";
import {
  getLifecyclePhaseTiming,
  VELOCITY_EFFORT_MEASUREMENT_NOTE,
} from "@/lib/pm/lifecycle-timing";
import type {
  ApplicationVelocityEffort,
  LifecycleVelocityAlert,
  VelocityEffortStats,
  VelocityTrend,
} from "@/lib/pm/velocity-types";

const MS_7D = 7 * 24 * 60 * 60 * 1000;
const MS_30D = 30 * 24 * 60 * 60 * 1000;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function computeVelocityScore(input: {
  commits7: number;
  commits30: number;
  tasksDone7: number;
  tasksDone30: number;
  edits7: number;
}): number {
  const commitSignal = Math.min(40, input.commits7 * 8 + input.commits30 * 0.5);
  const taskSignal = Math.min(40, input.tasksDone7 * 10 + input.tasksDone30 * 1.5);
  const editSignal = Math.min(20, input.edits7 * 2);
  return clampScore(commitSignal + taskSignal + editSignal);
}

function computeEffortScore(input: {
  spentHours: number;
  estimatedHours: number;
  commits30: number;
  edits30: number;
}): number {
  const hoursSignal = Math.min(50, input.spentHours * 4 + input.estimatedHours * 2);
  const commitSignal = Math.min(30, input.commits30 * 1.5);
  const editSignal = Math.min(20, input.edits30 * 0.5);
  return clampScore(hoursSignal + commitSignal + editSignal);
}

function computeTrend(current7: number, previous7: number): VelocityTrend {
  if (current7 === 0 && previous7 === 0) return "inactive";
  if (current7 > previous7 * 1.2) return "rising";
  if (current7 < previous7 * 0.8) return "falling";
  return "steady";
}

export const getVelocityEffortStats = cache(async (): Promise<VelocityEffortStats> => {
  const now = Date.now();
  const since7 = new Date(now - MS_7D);
  const since30 = new Date(now - MS_30D);
  const since14 = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const [applications, transitions30, tasks] = await Promise.all([
    prisma.application.findMany({
      where: { status: { not: "archived" } },
      include: { gitMeta: true },
    }),
    prisma.taskTransition.findMany({
      where: { createdAt: { gte: since30 } },
      include: { task: { select: { applicationId: true } } },
    }),
    prisma.task.findMany({
      select: {
        applicationId: true,
        status: true,
        estimationHours: true,
        timeSpentHours: true,
        updatedAt: true,
      },
    }),
  ]);

  const transitions7 = transitions30.filter((t) => t.createdAt >= since7);
  const transitionsPrev7 = transitions30.filter(
    (t) => t.createdAt >= since14 && t.createdAt < since7
  );

  const doneTransitions7 = transitions7.filter((t) => t.toStatus === "done");
  const doneTransitions30 = transitions30.filter((t) => t.toStatus === "done");
  const doneTransitionsPrev7 = transitionsPrev7.filter((t) => t.toStatus === "done");

  const byApplication: ApplicationVelocityEffort[] = [];
  const lifecycleAlerts: LifecycleVelocityAlert[] = [];

  let totalCommits7 = 0;
  let totalCommits30 = 0;
  let totalTasksDone7 = 0;
  let totalTasksDone30 = 0;
  let totalEdits7 = 0;
  let totalEstimated = 0;
  let totalSpent = 0;

  for (const app of applications) {
    const appTransitions7 = transitions7.filter((t) => t.task.applicationId === app.id);
    const appTransitions30 = transitions30.filter((t) => t.task.applicationId === app.id);
    const appDone7 = doneTransitions7.filter((t) => t.task.applicationId === app.id).length;
    const appDone30 = doneTransitions30.filter((t) => t.task.applicationId === app.id).length;
    const appDonePrev7 = doneTransitionsPrev7.filter(
      (t) => t.task.applicationId === app.id
    ).length;

    const appTasks = tasks.filter((t) => t.applicationId === app.id);
    const estimatedHours = appTasks.reduce((sum, t) => sum + (t.estimationHours ?? 0), 0);
    const spentHours = appTasks.reduce((sum, t) => sum + (t.timeSpentHours ?? 0), 0);
    const taskEdits7 = appTasks.filter((t) => t.updatedAt >= since7).length;

    const commits7 = app.gitMeta?.commitsLast7Days ?? 0;
    const commits30 = app.gitMeta?.commitsLast30Days ?? 0;
    const boardEdits7 = appTransitions7.length + taskEdits7;
    const boardEdits30 = appTransitions30.length;

    totalCommits7 += commits7;
    totalCommits30 += commits30;
    totalTasksDone7 += appDone7;
    totalTasksDone30 += appDone30;
    totalEdits7 += boardEdits7;
    totalEstimated += estimatedHours;
    totalSpent += spentHours;

    const velocityCurrent = appDone7 + commits7;
    const velocityPrevious = appDonePrev7 + Math.max(0, commits7 - 1);

    byApplication.push({
      applicationId: app.id,
      applicationName: app.name,
      lifecyclePhase: app.lifecyclePhase as LifecyclePhase,
      velocityScore: computeVelocityScore({
        commits7,
        commits30,
        tasksDone7: appDone7,
        tasksDone30: appDone30,
        edits7: boardEdits7,
      }),
      effortScore: computeEffortScore({
        spentHours,
        estimatedHours,
        commits30,
        edits30: boardEdits30,
      }),
      commitsLast7Days: commits7,
      commitsLast30Days: commits30,
      tasksCompletedLast7Days: appDone7,
      tasksCompletedLast30Days: appDone30,
      boardEditsLast7Days: boardEdits7,
      boardEditsLast30Days: boardEdits30,
      estimatedHours,
      spentHours,
      velocityTrend: computeTrend(velocityCurrent, velocityPrevious),
    });

    const phaseStartedAt = app.lifecyclePhaseStartedAt ?? app.updatedAt;
    const timing = getLifecyclePhaseTiming(
      app.lifecyclePhase as LifecyclePhase,
      phaseStartedAt
    );
    if (timing.isOverdue || timing.needsReview) {
      lifecycleAlerts.push({
        applicationId: app.id,
        applicationName: app.name,
        lifecyclePhase: app.lifecyclePhase as LifecyclePhase,
        daysInPhase: timing.daysInPhase,
        maxDays: timing.maxDays,
        isOverdue: timing.isOverdue,
        needsReview: timing.needsReview,
        message: timing.message,
      });
    }
  }

  byApplication.sort((a, b) => b.velocityScore - a.velocityScore);

  const portfolioVelocity =
    byApplication.length > 0
      ? clampScore(
          byApplication.reduce((sum, a) => sum + a.velocityScore, 0) / byApplication.length
        )
      : 0;

  const portfolioEffortScore = computeEffortScore({
    spentHours: totalSpent,
    estimatedHours: totalEstimated,
    commits30: totalCommits30,
    edits30: transitions30.length,
  });

  lifecycleAlerts.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return b.daysInPhase - a.daysInPhase;
  });

  return {
    portfolioVelocity,
    portfolioEffortScore,
    commitsLast7Days: totalCommits7,
    commitsLast30Days: totalCommits30,
    tasksCompletedLast7Days: totalTasksDone7,
    tasksCompletedLast30Days: totalTasksDone30,
    boardEditsLast7Days: totalEdits7,
    estimatedHours: totalEstimated,
    spentHours: totalSpent,
    byApplication,
    lifecycleAlerts,
    measurementNote: VELOCITY_EFFORT_MEASUREMENT_NOTE,
  };
});
