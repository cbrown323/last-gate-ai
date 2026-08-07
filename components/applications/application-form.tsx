"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  APPLICATION_STATUSES,
  LIFECYCLE_PHASE_LABELS,
  WORKFLOW_TYPE_LABELS,
  type Application,
  type ApplicationStatus,
  type LifecyclePhase,
  type WorkflowType,
} from "@/types";
import { Pencil, Plus } from "lucide-react";

const lifecyclePhases = Object.keys(LIFECYCLE_PHASE_LABELS) as LifecyclePhase[];
const workflowTypes = Object.keys(WORKFLOW_TYPE_LABELS) as WorkflowType[];

type FormState = {
  name: string;
  description: string;
  status: ApplicationStatus;
  repoUrl: string;
  websiteUrl: string;
  owner: string;
  lifecyclePhase: LifecyclePhase;
  workflowType: WorkflowType;
  ticketPrefix: string;
  doingWipLimit: number;
  isPinned: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  status: "development",
  repoUrl: "",
  websiteUrl: "",
  owner: "",
  lifecyclePhase: "development",
  workflowType: "kanban",
  ticketPrefix: "",
  doingWipLimit: 3,
  isPinned: false,
};

type ApplicationFields = Pick<
  Application,
  | "id"
  | "name"
  | "description"
  | "status"
  | "repoUrl"
  | "websiteUrl"
  | "owner"
  | "lifecyclePhase"
  | "workflowType"
  | "ticketPrefix"
  | "doingWipLimit"
  | "isPinned"
>;

function applicationToForm(application: Omit<ApplicationFields, "id">): FormState {
  return {
    name: application.name,
    description: application.description ?? "",
    status: application.status,
    repoUrl: application.repoUrl ?? "",
    websiteUrl: application.websiteUrl ?? "",
    owner: application.owner ?? "",
    lifecyclePhase: application.lifecyclePhase ?? "development",
    workflowType: application.workflowType ?? "kanban",
    ticketPrefix: application.ticketPrefix ?? "",
    doingWipLimit: application.doingWipLimit ?? 3,
    isPinned: application.isPinned ?? false,
  };
}

/**
 * Verify the token can actually reach the repo before saving, so access
 * problems (missing scope, org SSO, typo'd URL) surface now instead of at
 * sync time. Returns an error message, or null when access is confirmed.
 */
async function checkRepoAccess(repoUrl: string): Promise<string | null> {
  try {
    const res = await fetch("/api/github/verify-repo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!res.ok) return "Could not verify repository access";
    return data.ok ? null : (data.message ?? "Repository is not accessible");
  } catch {
    return "Could not verify repository access";
  }
}

function ApplicationFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  idPrefix: string;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={form.status}
          onValueChange={(v) => v && setForm({ ...form, status: v as ApplicationStatus })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-repoUrl`}>GitHub repo URL</Label>
        <Input
          id={`${idPrefix}-repoUrl`}
          placeholder="https://github.com/owner/repo"
          value={form.repoUrl}
          onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-websiteUrl`}>Website URL</Label>
        <Input
          id={`${idPrefix}-websiteUrl`}
          placeholder="https://..."
          value={form.websiteUrl}
          onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Lifecycle phase</Label>
          <Select
            value={form.lifecyclePhase}
            onValueChange={(v) => v && setForm({ ...form, lifecyclePhase: v as LifecyclePhase })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lifecyclePhases.map((p) => (
                <SelectItem key={p} value={p}>
                  {LIFECYCLE_PHASE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Workflow</Label>
          <Select
            value={form.workflowType}
            onValueChange={(v) => v && setForm({ ...form, workflowType: v as WorkflowType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflowTypes.map((w) => (
                <SelectItem key={w} value={w}>
                  {WORKFLOW_TYPE_LABELS[w]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-prefix`}>Ticket prefix</Label>
          <Input
            id={`${idPrefix}-prefix`}
            placeholder="LGA"
            value={form.ticketPrefix}
            onChange={(e) => setForm({ ...form, ticketPrefix: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-wip`}>WIP limit (In Progress)</Label>
          <Input
            id={`${idPrefix}-wip`}
            type="number"
            min={1}
            max={20}
            value={form.doingWipLimit}
            onChange={(e) =>
              setForm({ ...form, doingWipLimit: parseInt(e.target.value, 10) || 3 })
            }
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isPinned}
          onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
        />
        Pin to dashboard
      </label>
    </>
  );
}

export function ApplicationFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (form.repoUrl.trim()) {
        const accessError = await checkRepoAccess(form.repoUrl.trim());
        if (accessError) {
          setError(accessError);
          return;
        }
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-emerald-600 hover:bg-emerald-700" />}
      >
        <Plus className="size-4" />
        Add application
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ApplicationFormFields form={form} setForm={setForm} idPrefix="create" />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApplicationEditDialog({ application }: { application: ApplicationFields }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => applicationToForm(application));

  useEffect(() => {
    if (open) {
      setForm(applicationToForm(application));
      setError(null);
    }
  }, [open, application]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const repoUrlChanged = form.repoUrl.trim() !== (application.repoUrl ?? "").trim();
      if (form.repoUrl.trim() && repoUrlChanged) {
        const accessError = await checkRepoAccess(form.repoUrl.trim());
        if (accessError) {
          setError(accessError);
          return;
        }
      }

      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-4" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ApplicationFormFields form={form} setForm={setForm} idPrefix="edit" />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
