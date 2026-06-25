"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Boxes, Kanban, FileText, CalendarDays, Map, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SearchResultItem, SearchResultType } from "@/types";

const TYPE_META: Record<
  SearchResultType,
  { label: string; icon: typeof Boxes }
> = {
  application: { label: "Applications", icon: Boxes },
  task: { label: "Tasks", icon: Kanban },
  note: { label: "Notes", icon: FileText },
  event: { label: "Calendar", icon: CalendarDays },
  epic: { label: "Epics", icon: Map },
};

const GROUP_ORDER: SearchResultType[] = [
  "application",
  "task",
  "note",
  "event",
  "epic",
];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setActiveIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const navigate = useCallback(
    (item: SearchResultItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) navigate(item);
    }
  }

  const grouped = GROUP_ORDER.map((type) => ({
    type,
    items: results.filter((r) => r.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-accent flex h-9 w-full max-w-md items-center gap-2 rounded-md border bg-background px-3 text-sm transition-colors"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="bg-muted pointer-events-none hidden items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Global search</DialogTitle>
          <div className="flex items-center gap-3 border-b px-4 py-3">
            {loading ? (
              <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
            ) : (
              <Search className="text-muted-foreground size-4 shrink-0" />
            )}
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search applications, tasks, notes, events…"
              className="h-9 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div
            className={
              query.trim() && (loading || results.length > 0)
                ? "max-h-[min(60vh,24rem)] overflow-y-auto px-2 py-1.5"
                : undefined
            }
          >
            {query.trim() && !loading && results.length === 0 ? (
              <p className="text-muted-foreground px-4 py-2 text-center text-sm">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : null}

            {!query.trim() ? (
              <p className="text-muted-foreground px-4 py-2 text-center text-xs">
                Type to search across your whole portfolio.
              </p>
            ) : null}

            {grouped.map((group) => {
              const Meta = TYPE_META[group.type];
              return (
                <div key={group.type} className="mb-2">
                  <p className="text-muted-foreground px-2 py-1 text-xs font-medium">
                    {Meta.label}
                  </p>
                  {group.items.map((item) => {
                    const itemIndex = results.indexOf(item);
                    const isActive = itemIndex === activeIndex;
                    const Icon = TYPE_META[item.type].icon;
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm ${
                          isActive ? "bg-accent" : ""
                        }`}
                      >
                        <Icon className="text-muted-foreground size-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-muted-foreground truncate text-xs">
                              {item.subtitle}
                            </p>
                          ) : null}
                        </div>
                        {item.badge ? (
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {item.badge}
                          </Badge>
                        ) : null}
                        {isActive ? (
                          <CornerDownLeft className="text-muted-foreground size-3 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
