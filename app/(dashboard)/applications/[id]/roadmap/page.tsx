import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { RoadmapBoard } from "@/components/applications/roadmap-board";
import { serializeEpic } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Kanban } from "lucide-react";

export default async function ApplicationRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      epics: {
        include: { _count: { select: { tasks: true } } },
        orderBy: [{ position: "asc" }, { startsAt: "asc" }],
      },
    },
  });

  if (!application) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${application.name} — Roadmap`}
        description="Epic timeline for planning releases and feature tracks"
        actions={
          <div className="flex gap-2">
            <Link
              href={`/applications/${id}/tasks`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Kanban className="mr-1 size-4" />
              Board
            </Link>
            <Link
              href={`/applications/${id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <ArrowLeft className="mr-1 size-4" />
              App detail
            </Link>
          </div>
        }
      />
      <RoadmapBoard
        applicationId={id}
        initialEpics={application.epics.map(serializeEpic)}
      />
    </div>
  );
}
