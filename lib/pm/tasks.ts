import { prisma } from "@/lib/db";
import type { TaskStatus } from "@/types";

export async function generateTaskCode(applicationId: string): Promise<string | null> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { ticketPrefix: true, name: true },
  });
  if (!app) return null;

  const prefix =
    app.ticketPrefix?.toUpperCase() ||
    app.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase() ||
    "TASK";

  const count = await prisma.task.count({ where: { applicationId } });
  return `${prefix}-${count + 1}`;
}

export async function recordTaskTransition(
  taskId: string,
  fromStatus: string | null,
  toStatus: string,
  note?: string
) {
  return prisma.taskTransition.create({
    data: { taskId, fromStatus, toStatus, note },
  });
}

export function reorderTasks<T extends { id: string; status: string; position: number }>(
  tasks: T[],
  taskId: string,
  newStatus: TaskStatus,
  newPosition: number
): T[] {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return tasks;

  const oldStatus = task.status as TaskStatus;
  const without = tasks.filter((t) => t.id !== taskId);

  const updated = without.map((t) => {
    if (t.status === oldStatus && t.position > task.position) {
      return { ...t, position: t.position - 1 };
    }
    if (t.status === newStatus && t.position >= newPosition) {
      return { ...t, position: t.position + 1 };
    }
    return t;
  });

  return [
    ...updated,
    { ...task, status: newStatus, position: newPosition },
  ].sort((a, b) =>
    a.status === b.status ? a.position - b.position : a.status.localeCompare(b.status)
  );
}
