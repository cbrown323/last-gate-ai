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

  // Obsidian-style: clicking an unresolved [[wikilink]] creates the note in the current vault.
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
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Obsidian-style knowledge base — organize notes by project vault or keep standalone workspace notes, link with [[wikilinks]], and follow backlinks."
      />
      <Suspense fallback={<p className="text-muted-foreground text-sm">Loading notes…</p>}>
        <NotesWorkspace
          applications={applications}
          initialNoteId={params.note}
          initialScope={parseNotesScope(params.app)}
        />
      </Suspense>
    </div>
  );
}
