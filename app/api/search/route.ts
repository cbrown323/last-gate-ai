import { NextResponse } from "next/server";
import { notesHref } from "@/lib/notes/grouping";
import { prisma } from "@/lib/db";
import type {
  SearchResponse,
  SearchResultItem,
  SearchResultType,
} from "@/types";

const EMPTY_COUNTS: Record<SearchResultType, number> = {
  application: 0,
  task: 0,
  note: 0,
  event: 0,
  epic: 0,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 1) {
    return NextResponse.json<SearchResponse>({
      query,
      results: [],
      counts: { ...EMPTY_COUNTS },
    });
  }

  const take = 6;

  const [applications, tasks, notes, events, epics] = await Promise.all([
    prisma.application.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { owner: { contains: query } },
        ],
      },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { code: { contains: query } },
        ],
      },
      include: { application: { select: { name: true } } },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.note.findMany({
      where: {
        OR: [{ title: { contains: query } }, { content: { contains: query } }],
      },
      include: { application: { select: { name: true } } },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.calendarEvent.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: { application: { select: { name: true } } },
      take,
      orderBy: { startAt: "desc" },
    }),
    prisma.epic.findMany({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
      include: { application: { select: { name: true } } },
      take,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: SearchResultItem[] = [
    ...applications.map<SearchResultItem>((a) => ({
      id: a.id,
      type: "application",
      title: a.name,
      subtitle: a.description ?? a.status,
      href: `/applications/${a.id}`,
      badge: a.status,
    })),
    ...tasks.map<SearchResultItem>((t) => ({
      id: t.id,
      type: "task",
      title: t.title,
      subtitle: t.application?.name ?? null,
      href: `/applications/${t.applicationId}/tasks`,
      badge: t.code ?? t.status,
    })),
    ...notes.map<SearchResultItem>((n) => ({
      id: n.id,
      type: "note",
      title: n.title,
      subtitle: n.application?.name ?? "Workspace note",
      href: notesHref(
        { note: n.id },
        n.applicationId ? n.applicationId : "workspace"
      ),
      badge: "note",
    })),
    ...events.map<SearchResultItem>((e) => ({
      id: e.id,
      type: "event",
      title: e.title,
      subtitle: e.application?.name ?? "Workspace",
      href: e.applicationId
        ? `/calendar?app=${e.applicationId}`
        : `/calendar`,
      badge: e.type,
    })),
    ...epics.map<SearchResultItem>((ep) => ({
      id: ep.id,
      type: "epic",
      title: ep.name,
      subtitle: ep.application?.name ?? null,
      href: `/applications/${ep.applicationId}/roadmap`,
      badge: "epic",
    })),
  ];

  const counts: Record<SearchResultType, number> = {
    application: applications.length,
    task: tasks.length,
    note: notes.length,
    event: events.length,
    epic: epics.length,
  };

  return NextResponse.json<SearchResponse>({ query, results, counts });
}
