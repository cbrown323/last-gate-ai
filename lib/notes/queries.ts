import { prisma } from "@/lib/db";
import { serializeNote } from "@/lib/serialize";
import { contentLinksTo, extractWikilinkTitles, normalizeTitle } from "@/lib/notes/wikilinks";
import type { Note, NoteLink, NoteWithLinks } from "@/types";

export async function listNotes(applicationId?: string | null): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where:
      applicationId === undefined
        ? {}
        : applicationId === null
          ? { applicationId: null }
          : { applicationId },
    include: { application: { select: { name: true } } },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
  return notes.map(serializeNote);
}

export async function getNoteWithLinks(id: string): Promise<NoteWithLinks | null> {
  const note = await prisma.note.findUnique({
    where: { id },
    include: { application: { select: { name: true } } },
  });
  if (!note) return null;

  const serialized = serializeNote(note);

  const allNotes = await prisma.note.findMany({
    select: { id: true, title: true, content: true, applicationId: true },
  });

  const byTitle = new Map<string, { id: string; title: string; applicationId: string | null }>();
  for (const n of allNotes) {
    byTitle.set(normalizeTitle(n.title), {
      id: n.id,
      title: n.title,
      applicationId: n.applicationId,
    });
  }

  const outgoingLinks: NoteLink[] = [];
  for (const title of extractWikilinkTitles(note.content)) {
    const target = byTitle.get(normalizeTitle(title));
    if (target && target.id !== note.id) {
      outgoingLinks.push(target);
    }
  }

  const backlinks: NoteLink[] = allNotes
    .filter((n) => n.id !== note.id && contentLinksTo(n.content, note.title))
    .map((n) => ({ id: n.id, title: n.title, applicationId: n.applicationId }));

  return {
    ...serialized,
    outgoingLinks: dedupeLinks(outgoingLinks),
    backlinks: dedupeLinks(backlinks),
  };
}

function dedupeLinks(links: NoteLink[]): NoteLink[] {
  const seen = new Set<string>();
  const out: NoteLink[] = [];
  for (const link of links) {
    if (seen.has(link.id)) continue;
    seen.add(link.id);
    out.push(link);
  }
  return out;
}
