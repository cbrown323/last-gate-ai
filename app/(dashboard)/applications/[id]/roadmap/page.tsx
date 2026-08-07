import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { RoadmapBoard } from "@/components/applications/roadmap-board";
import { serializeEpic } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { ArrowLeft } from "lucide-react";
import { PmViewSwitcher } from "@/components/applications/pm-view-switcher";

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
          <div className="flex flex-wrap items-center gap-2">
            <PmViewSwitcher applicationId={id} view="roadmap" />
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
      <RoadmapBoard
        applicationId={id}
        initialEpics={application.epics.map(serializeEpic)}
      />
    </div>
  );
}
