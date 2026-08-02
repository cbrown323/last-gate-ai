"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderMarkdown } from "@/lib/notes/markdown";
import {
  ALL_SCOPE,
  WORKSPACE_SCOPE,
  groupNotesByProject,
  notesApiPath,
  notesHref,
  scopeLabel,
  scopeToApplicationId,
  scopeToSearchParam,
  type NotesScope,
} from "@/lib/notes/grouping";
import { normalizeTitle } from "@/lib/notes/wikilinks";
import { cn } from "@/lib/utils";
import type { Note, NoteLink, NoteWithLinks } from "@/types";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Link2,
  Eye,
  Pencil,
  Columns2,
  Loader2,
  Hash,
  Check,
  FolderOpen,
} from "lucide-react";

type ViewMode = "edit" | "split" | "preview";
type SaveState = "idle" | "saving" | "saved";

type VaultGroupStyle = {
  container: string;
  header: string;
  icon: string;
  badge: string;
};

const WORKSPACE_VAULT_STYLE: VaultGroupStyle = {
  container:
    "border-slate-200/80 bg-slate-50/70 dark:border-slate-700/55 dark:bg-slate-900/35",
  header: "text-slate-800 dark:text-slate-100",
  icon: "text-slate-500 dark:text-slate-400",
  badge:
    "border-slate-200/80 bg-slate-100/90 text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200",
};

const PROJECT_VAULT_PALETTE: VaultGroupStyle[] = [
  {
    container:
      "border-emerald-200/70 bg-emerald-50/55 dark:border-emerald-900/45 dark:bg-emerald-950/25",
    header: "text-emerald-900 dark:text-emerald-100",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge:
      "border-emerald-200/70 bg-emerald-100/80 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
  {
    container:
      "border-sky-200/70 bg-sky-50/55 dark:border-sky-900/45 dark:bg-sky-950/25",
    header: "text-sky-900 dark:text-sky-100",
    icon: "text-sky-600 dark:text-sky-400",
    badge:
      "border-sky-200/70 bg-sky-100/80 text-sky-800 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-100",
  },
  {
    container:
      "border-violet-200/70 bg-violet-50/55 dark:border-violet-900/45 dark:bg-violet-950/25",
    header: "text-violet-900 dark:text-violet-100",
    icon: "text-violet-600 dark:text-violet-400",
    badge:
      "border-violet-200/70 bg-violet-100/80 text-violet-800 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-100",
  },
  {
    container:
      "border-amber-200/70 bg-amber-50/55 dark:border-amber-900/45 dark:bg-amber-950/25",
    header: "text-amber-900 dark:text-amber-100",
    icon: "text-amber-600 dark:text-amber-400",
    badge:
      "border-amber-200/70 bg-amber-100/80 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-100",
  },
  {
    container:
      "border-rose-200/70 bg-rose-50/55 dark:border-rose-900/45 dark:bg-rose-950/25",
    header: "text-rose-900 dark:text-rose-100",
    icon: "text-rose-600 dark:text-rose-400",
    badge:
      "border-rose-200/70 bg-rose-100/80 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-100",
  },
];

function vaultGroupStyle(groupKey: string): VaultGroupStyle {
  if (groupKey === WORKSPACE_SCOPE) return WORKSPACE_VAULT_STYLE;
  let hash = 0;
  for (let i = 0; i < groupKey.length; i++) {
    hash = (hash + groupKey.charCodeAt(i)) | 0;
  }
  return PROJECT_VAULT_PALETTE[Math.abs(hash) % PROJECT_VAULT_PALETTE.length];
}

export function NotesWorkspace({
  applicationId: fixedApplicationId,
  applications = [],
  initialNoteId,
  initialScope,
  className,
}: {
  applicationId?: string;
  applications?: { id: string; name: string }[];
  initialNoteId?: string;
  initialScope?: NotesScope;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGlobalVault = !fixedApplicationId && applications.length > 0;

  const [scope, setScope] = useState<NotesScope>(
    initialScope ?? fixedApplicationId ?? ALL_SCOPE
  );
  const [notes, setNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialNoteId ?? null);
  const [links, setLinks] = useState<{
    backlinks: NoteLink[];
    outgoingLinks: NoteLink[];
  }>({ backlinks: [], outgoingLinks: [] });
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [view, setView] = useState<ViewMode>("split");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wikilinkApp = fixedApplicationId ?? (scope !== ALL_SCOPE ? scope : WORKSPACE_SCOPE);

  const syncScopeToUrl = useCallback(
    (nextScope: NotesScope) => {
      if (!isGlobalVault) return;
      const params = new URLSearchParams(searchParams.toString());
      const appParam = scopeToSearchParam(nextScope);
      if (appParam) params.set("app", appParam);
      else params.delete("app");
      const qs = params.toString();
      router.replace(qs ? `/notes?${qs}` : "/notes", { scroll: false });
    },
    [isGlobalVault, router, searchParams]
  );

  const handleScopeChange = useCallback(
    (next: NotesScope) => {
      setScope(next);
      syncScopeToUrl(next);
    },
    [syncScopeToUrl]
  );

  const loadNotes = useCallback(async () => {
    const scopedPath = notesApiPath(scope, fixedApplicationId);
    const [scopedRes, allRes] = await Promise.all([
      fetch(scopedPath),
      fetch("/api/notes"),
    ]);
    const scoped: Note[] = scopedRes.ok ? await scopedRes.json() : [];
    const all: Note[] = allRes.ok ? await allRes.json() : scoped;
    setNotes(scoped);
    setAllNotes(all);
    setLoading(false);
    return scoped;
  }, [scope, fixedApplicationId]);

  useEffect(() => {
    setLoading(true);
    loadNotes().then((scoped) => {
      if (!activeId && scoped.length > 0) {
        setActiveId(initialNoteId ?? scoped[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadNotes]);

  const loadActive = useCallback(async (id: string) => {
    const res = await fetch(`/api/notes/${id}`);
    if (!res.ok) return;
    const data: NoteWithLinks = await res.json();
    setTitle(data.title);
    setContent(data.content);
    setLinks({ backlinks: data.backlinks, outgoingLinks: data.outgoingLinks });
  }, []);

  useEffect(() => {
    if (activeId) loadActive(activeId);
  }, [activeId, loadActive]);

  const persist = useCallback(
    async (
      id: string,
      patch: { title?: string; content?: string; applicationId?: string | null }
    ) => {
      setSaveState("saving");
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSaveState("saved");
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                ...patch,
                updatedAt: new Date().toISOString(),
                applicationName:
                  patch.applicationId === undefined
                    ? n.applicationName
                    : patch.applicationId
                      ? applications.find((a) => a.id === patch.applicationId)?.name ??
                        n.applicationName
                      : null,
              }
            : n
        )
      );
      setAllNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                ...patch,
                applicationName:
                  patch.applicationId === undefined
                    ? n.applicationName
                    : patch.applicationId
                      ? applications.find((a) => a.id === patch.applicationId)?.name ??
                        n.applicationName
                      : null,
              }
            : n
        )
      );
      if (linkTimer.current) clearTimeout(linkTimer.current);
      linkTimer.current = setTimeout(() => loadActive(id), 400);
      if (patch.applicationId !== undefined) {
        loadNotes();
      }
    },
    [applications, loadActive, loadNotes]
  );

  function scheduleSave(next: { title?: string; content?: string }) {
    if (!activeId) return;
    setSaveState("idle");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(activeId, next), 600);
  }

  async function createNote() {
    const targetAppId = scopeToApplicationId(scope, fixedApplicationId);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled note",
        content: "",
        applicationId: targetAppId,
      }),
    });
    if (!res.ok) return;
    const note: Note = await res.json();
    setNotes((prev) => [note, ...prev]);
    setAllNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setTitle(note.title);
    setContent("");
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    setAllNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(remaining[0]?.id ?? null);
      if (!remaining[0]) {
        setTitle("");
        setContent("");
      }
    }
  }

  async function togglePin(note: Note) {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    });
    if (res.ok) loadNotes();
  }

  async function assignProject(noteId: string, appId: string | null) {
    await persist(noteId, { applicationId: appId });
  }

  const resolver = useMemo(() => {
    const map = new Map<string, { id: string }>();
    for (const n of allNotes) {
      map.set(normalizeTitle(n.title), { id: n.id });
    }

    return (linkTitle: string) => {
      const found = map.get(normalizeTitle(linkTitle));
      if (found) {
        return {
          href: notesHref({ note: found.id }, wikilinkApp, fixedApplicationId),
          exists: true,
        };
      }
      return {
        href: notesHref({ new: linkTitle }, wikilinkApp, fixedApplicationId),
        exists: false,
      };
    };
  }, [allNotes, wikilinkApp, fixedApplicationId]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, filter]);

  const grouped = useMemo(() => {
    if (!isGlobalVault || scope !== ALL_SCOPE) return null;
    return groupNotesByProject(filtered, applications);
  }, [isGlobalVault, scope, filtered, applications]);

  const activeNote = notes.find((n) => n.id === activeId) ?? allNotes.find((n) => n.id === activeId) ?? null;
  const createTargetLabel = isGlobalVault
    ? scope === ALL_SCOPE
      ? "workspace"
      : scopeLabel(scope, applications).toLowerCase()
    : null;

  const rendered = useMemo(
    () => renderMarkdown(content, resolver),
    [content, resolver]
  );

  return (
    <div
      className={cn(
        "grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[260px_1fr]",
        className ?? "h-[calc(100vh-13rem)]"
      )}
    >
      <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border">
        <div className="shrink-0 space-y-2 border-b p-3">
          {isGlobalVault ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                Vault
              </p>
              <Select
                value={scope === ALL_SCOPE ? ALL_SCOPE : scope}
                onValueChange={(v) => v && handleScopeChange(v as NotesScope)}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue>{scopeLabel(scope, applications)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SCOPE}>All notes</SelectItem>
                  <SelectItem value={WORKSPACE_SCOPE}>Workspace (standalone)</SelectItem>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <Button onClick={createNote} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 size-4" />
            {isGlobalVault && scope === ALL_SCOPE ? "New workspace note" : "New note"}
          </Button>
          {createTargetLabel ? (
            <p className="text-muted-foreground text-[10px]">
              New notes go to <span className="font-medium">{createTargetLabel}</span>
              {scope === ALL_SCOPE ? " — pick a project vault to classify by project" : null}
            </p>
          ) : null}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter notes…"
              className="h-8 pl-7 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">
            {loading ? (
              <p className="text-muted-foreground p-2 text-sm">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground p-2 text-sm">No notes yet.</p>
            ) : grouped ? (
              <div className="space-y-2">
                {grouped.map((group) => (
                  <VaultNoteGroup
                    key={group.key}
                    label={group.label}
                    noteCount={group.notes.length}
                    style={vaultGroupStyle(group.key)}
                  >
                    {group.notes.map((note) => (
                      <NoteListItem
                        key={note.id}
                        note={note}
                        activeId={activeId}
                        onSelect={setActiveId}
                        showProject={false}
                        inVaultGroup
                      />
                    ))}
                  </VaultNoteGroup>
                ))}
              </div>
            ) : (
              filtered.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  activeId={activeId}
                  onSelect={setActiveId}
                  showProject={isGlobalVault && scope === ALL_SCOPE}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {activeNote ? (
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-3">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                scheduleSave({ title: e.target.value });
              }}
              className="h-9 flex-1 border-0 bg-transparent pl-2 pr-0 text-lg font-semibold text-foreground/75 shadow-none focus-visible:ring-0"
              placeholder="Note title"
            />
            <div className="flex items-center gap-1">
              {isGlobalVault ? (
                <Select
                  value={activeNote.applicationId ?? WORKSPACE_SCOPE}
                  onValueChange={(v) => {
                    if (!v) return;
                    assignProject(
                      activeNote.id,
                      v === WORKSPACE_SCOPE ? null : v
                    );
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue>
                      {scopeLabel(activeNote.applicationId ?? WORKSPACE_SCOPE, applications)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WORKSPACE_SCOPE}>Workspace</SelectItem>
                    {applications.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <SaveIndicator state={saveState} />
              <div className="flex rounded-md border">
                <ViewButton active={view === "edit"} onClick={() => setView("edit")} icon={Pencil} />
                <ViewButton active={view === "split"} onClick={() => setView("split")} icon={Columns2} />
                <ViewButton active={view === "preview"} onClick={() => setView("preview")} icon={Eye} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => togglePin(activeNote)}>
                {activeNote.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNote(activeNote.id)}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
            {view !== "preview" ? (
              <div
                className={cn(
                  "flex min-h-0 flex-col overflow-hidden",
                  view === "split" ? "border-r" : "md:col-span-2"
                )}
              >
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    scheduleSave({ content: e.target.value });
                  }}
                  spellCheck
                  placeholder={"Write in markdown. Link notes with [[Note title]].\n\n# Heading\n- bullet\n**bold**, *italic*, `code`"}
                  className="min-h-0 flex-1 resize-none overflow-y-auto bg-background p-4 font-mono text-sm leading-relaxed outline-none"
                />
              </div>
            ) : null}
            {view !== "edit" ? (
              <div
                className={cn(
                  "flex min-h-0 flex-col overflow-hidden",
                  view === "preview" ? "md:col-span-2" : ""
                )}
              >
                <ScrollArea className="min-h-0 flex-1">
                  <div className="p-4">
                    {content.trim() ? (
                      rendered
                    ) : (
                      <p className="text-muted-foreground text-sm">Nothing to preview yet.</p>
                    )}
                    <LinksPanel
                      links={links}
                      wikilinkApp={wikilinkApp}
                      fixedApplicationId={fixedApplicationId}
                    />
                  </div>
                </ScrollArea>
              </div>
            ) : null}
          </div>

          {activeNote.tags.length > 0 ? (
            <div className="flex shrink-0 flex-wrap items-center gap-1 border-t p-2">
              <Hash className="text-muted-foreground size-3" />
              {activeNote.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-lg border text-center">
          <FileText className="text-muted-foreground mb-3 size-10" />
          <p className="font-medium">No note selected</p>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            Create a note in your workspace or pick a project vault. Use{" "}
            <code className="rounded bg-muted px-1">[[links]]</code> to connect ideas.
          </p>
          <Button onClick={createNote} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-1 size-4" />
            New note
          </Button>
        </div>
      )}
    </div>
  );
}

function VaultNoteGroup({
  label,
  noteCount,
  style,
  children,
}: {
  label: string;
  noteCount: number;
  style: VaultGroupStyle;
  children: ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border shadow-sm", style.container)}>
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b border-inherit px-2.5 py-2",
          style.header
        )}
      >
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold tracking-wide">
          <FolderOpen className={cn("size-3.5 shrink-0", style.icon)} />
          <span className="truncate uppercase">{label}</span>
        </p>
        <Badge variant="outline" className={cn("h-5 shrink-0 px-1.5 text-[10px]", style.badge)}>
          {noteCount}
        </Badge>
      </div>
      <div className="space-y-0.5 p-1">{children}</div>
    </section>
  );
}

function NoteListItem({
  note,
  activeId,
  onSelect,
  showProject,
  inVaultGroup = false,
}: {
  note: Note;
  activeId: string | null;
  onSelect: (id: string) => void;
  showProject: boolean;
  inVaultGroup?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        "group flex w-full items-start gap-2 rounded-md p-2 text-left transition-colors",
        inVaultGroup
          ? note.id === activeId
            ? "bg-background/85 shadow-sm ring-1 ring-border/70"
            : "hover:bg-background/55"
          : note.id === activeId
            ? "bg-accent"
            : "hover:bg-accent/50"
      )}
    >
      <FileText className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          {note.isPinned ? (
            <Pin className="size-3 shrink-0 text-emerald-600" />
          ) : null}
          <p className="truncate text-sm font-medium">{note.title}</p>
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {showProject ? `${note.applicationName ?? "Workspace"} · ` : ""}
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-8 items-center justify-center first:rounded-l-md last:rounded-r-md ${
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        <Loader2 className="size-3 animate-spin" />
        Saving
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Check className="size-3" />
        Saved
      </span>
    );
  }
  return <span className="text-muted-foreground text-xs">Auto-save on</span>;
}

function LinksPanel({
  links,
  wikilinkApp,
  fixedApplicationId,
}: {
  links: { backlinks: NoteLink[]; outgoingLinks: NoteLink[] };
  wikilinkApp: NotesScope;
  fixedApplicationId?: string;
}) {
  if (links.backlinks.length === 0 && links.outgoingLinks.length === 0) return null;
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      {links.outgoingLinks.length > 0 ? (
        <div>
          <p className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-medium">
            <Link2 className="size-3" />
            Links to
          </p>
          <div className="flex flex-wrap gap-1">
            {links.outgoingLinks.map((l) => (
              <a
                key={l.id}
                href={notesHref({ note: l.id }, wikilinkApp, fixedApplicationId)}
                className="rounded border px-2 py-0.5 text-xs hover:bg-accent"
              >
                {l.title}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {links.backlinks.length > 0 ? (
        <div>
          <p className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-medium">
            <Link2 className="size-3" />
            Linked from ({links.backlinks.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {links.backlinks.map((l) => (
              <a
                key={l.id}
                href={notesHref({ note: l.id }, wikilinkApp, fixedApplicationId)}
                className="rounded border px-2 py-0.5 text-xs hover:bg-accent"
              >
                {l.title}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
