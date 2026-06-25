import type { Note } from "@/types";

export type NotesScope = "all" | "workspace" | string;

export const WORKSPACE_SCOPE = "workspace" as const;
export const ALL_SCOPE = "all" as const;

export function notesApiPath(scope: NotesScope, fixedApplicationId?: string): string {
  if (fixedApplicationId) {
    return `/api/notes?applicationId=${fixedApplicationId}`;
  }
  if (scope === ALL_SCOPE) return "/api/notes";
  if (scope === WORKSPACE_SCOPE) return "/api/notes?applicationId=workspace";
  return `/api/notes?applicationId=${scope}`;
}

export function scopeToApplicationId(
  scope: NotesScope,
  fixedApplicationId?: string
): string | null {
  if (fixedApplicationId) return fixedApplicationId;
  if (scope === WORKSPACE_SCOPE || scope === ALL_SCOPE) return null;
  return scope;
}

export function scopeLabel(
  scope: NotesScope,
  applications: { id: string; name: string }[]
): string {
  if (scope === ALL_SCOPE) return "All notes";
  if (scope === WORKSPACE_SCOPE) return "Workspace";
  return applications.find((a) => a.id === scope)?.name ?? "Project";
}

export interface NoteGroup {
  key: string;
  label: string;
  notes: Note[];
}

export function groupNotesByProject(
  notes: Note[],
  applications: { id: string; name: string }[]
): NoteGroup[] {
  const byApp = new Map<string | null, Note[]>();
  for (const note of notes) {
    const key = note.applicationId;
    const list = byApp.get(key) ?? [];
    list.push(note);
    byApp.set(key, list);
  }

  const groups: NoteGroup[] = [];

  const workspace = byApp.get(null);
  if (workspace?.length) {
    groups.push({ key: WORKSPACE_SCOPE, label: "Workspace", notes: workspace });
  }

  const appNames = new Map(applications.map((a) => [a.id, a.name]));
  const projectIds = [...byApp.keys()].filter((k): k is string => k !== null);
  projectIds.sort((a, b) =>
    (appNames.get(a) ?? a).localeCompare(appNames.get(b) ?? b)
  );

  for (const id of projectIds) {
    const list = byApp.get(id);
    if (!list?.length) continue;
    groups.push({
      key: id,
      label: appNames.get(id) ?? "Unknown project",
      notes: list,
    });
  }

  return groups;
}

export function parseNotesScope(
  appParam: string | undefined,
  fixedApplicationId?: string
): NotesScope {
  if (fixedApplicationId) return fixedApplicationId;
  if (!appParam) return ALL_SCOPE;
  if (appParam === WORKSPACE_SCOPE) return WORKSPACE_SCOPE;
  return appParam;
}

export function scopeToSearchParam(scope: NotesScope): string | null {
  if (scope === ALL_SCOPE) return null;
  return scope;
}

export function notesAppQuery(scope: NotesScope, fixedApplicationId?: string): string {
  const effective = fixedApplicationId ?? scope;
  if (effective === ALL_SCOPE) return "";
  if (effective === WORKSPACE_SCOPE) return "app=workspace";
  return `app=${effective}`;
}

export function notesHref(
  params: { note?: string; new?: string },
  scope: NotesScope,
  fixedApplicationId?: string
): string {
  const appQuery = notesAppQuery(scope, fixedApplicationId);
  const parts: string[] = [];
  if (params.note) parts.push(`note=${params.note}`);
  if (params.new) parts.push(`new=${encodeURIComponent(params.new)}`);
  if (appQuery) parts.push(appQuery);
  return parts.length ? `/notes?${parts.join("&")}` : "/notes";
}
