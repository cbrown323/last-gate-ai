import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { parseNotesScope } from "@/lib/notes/grouping";
import { prisma } from "@/lib/db";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string; new?: string; app?: string }>;
}) {
  const params = await searchParams;

  // Clicking an unresolved [[wikilink]] creates a note with that title in the current vault.
  if (params.new) {
    const applicationId =
      params.app && params.app !== "workspace" ? params.app : null;
    const created = await prisma.note.create({
      data: {
        title: params.new,
        content: "",
        applicationId,
      },
    });
    const appQuery = params.app ? `&app=${params.app}` : "";
    redirect(`/notes?note=${created.id}${appQuery}`);
  }

  const applications = await prisma.application.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-[calc(100svh-3.5rem-2rem)] flex-col gap-6 md:h-[calc(100svh-3.5rem-3rem)]">
      <div className="shrink-0">
        <PageHeader
          title="Notes"
          description="Type [[Note title]] in a note to link to another note. Click a link to open it; if that title does not exist yet, a new note is created in the current vault."
        />
      </div>
      <Suspense
        fallback={
          <p className="text-muted-foreground min-h-0 flex-1 text-sm">Loading notes…</p>
        }
      >
        <NotesWorkspace
          className="min-h-0 flex-1"
          applications={applications}
          initialNoteId={params.note}
          initialScope={parseNotesScope(params.app)}
        />
      </Suspense>
    </div>
  );
}
