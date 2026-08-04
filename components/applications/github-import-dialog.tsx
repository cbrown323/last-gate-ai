"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";

type GitHubRepo = {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  isPrivate: boolean;
  updatedAt: string;
  registered: boolean;
};

export function GitHubImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repos");
      const data = (await res.json()) as { repos?: GitHubRepo[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load GitHub repos");
      }
      setRepos(data.repos ?? []);
      setSelected(new Set((data.repos ?? []).filter((repo) => !repo.registered).map((repo) => repo.htmlUrl)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GitHub repos");
      setRepos([]);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadRepos();
    }
  }, [open, loadRepos]);

  const unregistered = repos.filter((repo) => !repo.registered);

  function toggleRepo(url: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrls: Array.from(selected) }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Import failed");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Download className="size-4" />
        Import from GitHub
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from GitHub</DialogTitle>
          <DialogDescription>
            Pull repositories from your connected GitHub account into the portfolio registry.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading repositories...
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadRepos()}>
              Retry
            </Button>
          </div>
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">No repositories found on your GitHub account.</p>
        ) : unregistered.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">
            All accessible repositories are already registered.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {repos.map((repo) => (
                <label
                  key={repo.htmlUrl}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                    repo.registered ? "opacity-60" : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={repo.registered || selected.has(repo.htmlUrl)}
                    disabled={repo.registered}
                    onChange={() => toggleRepo(repo.htmlUrl)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{repo.fullName}</span>
                      {repo.registered ? (
                        <Badge variant="secondary">Registered</Badge>
                      ) : repo.isPrivate ? (
                        <Badge variant="outline">Private</Badge>
                      ) : (
                        <Badge variant="outline">Public</Badge>
                      )}
                    </div>
                    {repo.description ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={importing || selected.size === 0}
              onClick={() => void handleImport()}
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${selected.size} ${selected.size === 1 ? "repository" : "repositories"}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
