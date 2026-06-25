import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/applications/kanban-board";
import { LifecycleBanner } from "@/components/applications/lifecycle-banner";
import { serializeEpic, serializeTask } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PmViewSwitcher } from "@/components/applications/pm-view-switcher";
import type { LifecyclePhase, WorkflowType } from "@/types";

export default async function ApplicationTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { id } = await params;
  const { task: initialTaskId } = await searchParams;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      tasks: {
        where: { isClosed: false },
        orderBy: [{ status: "asc" }, { position: "asc" }],
        include: { subtasks: true, comments: { take: 3 }, epic: true },
      },
      epics: { orderBy: { position: "asc" } },
    },
  });

  if (!application) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${application.name} — Tasks`}
        description="Kanban board with WIP limits, priorities, and task details"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PmViewSwitcher applicationId={id} view="tasks" />
            <Link
              href={`/applications/${id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ArrowLeft className="mr-1 size-4" />
              App detail
            </Link>
          </div>
        }
      />
      <LifecycleBanner
        applicationId={id}
        lifecyclePhase={application.lifecyclePhase as LifecyclePhase}
        workflowType={application.workflowType as WorkflowType}
        lifecyclePhaseStartedAt={(
          application.lifecyclePhaseStartedAt ?? application.updatedAt
        ).toISOString()}
      />
      <KanbanBoard
        applicationId={id}
        initialTasks={application.tasks.map(serializeTask)}
        initialTaskId={initialTaskId}
        epics={application.epics.map(serializeEpic)}
        doingWipLimit={application.doingWipLimit}
        workflowType={application.workflowType as WorkflowType}
      />
    </div>
  );
}
