import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAYBOOK_SECTIONS, getPhaseGuidance, LIFECYCLE_PHASES, LIFECYCLE_PHASE_DESCRIPTIONS } from "@/lib/pm/playbook";
import { LIFECYCLE_PHASE_LABELS } from "@/types";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

export default function PlaybookPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Project management playbook"
        description="Built-in guidance on product lifecycle, Kanban, Scrum, and delivery — so you don't have to guess how to run a project."
      />

      <Card className="border-emerald-200/50 bg-emerald-50/20 dark:bg-emerald-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-emerald-600" />
            Why this exists
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Most people manage software without formal PM training. Last Gate integrates patterns from{" "}
            <a
              href="https://github.com/kanboard/kanboard"
              className="text-emerald-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Kanboard
            </a>{" "}
            (visual flow, WIP limits) and{" "}
            <a
              href="https://github.com/devaslanphp/project-management"
              className="text-emerald-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Helper
            </a>{" "}
            (dashboards, epics, roadmaps) — plus portfolio intelligence unique to this platform.
          </p>
          <p>
            Set a <strong className="text-foreground">lifecycle phase</strong> on each application.
            The board, roadmap, and dashboard adapt to where you are in the journey.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Product lifecycle phases</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {LIFECYCLE_PHASES.map((phase) => (
            <Card key={phase}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{LIFECYCLE_PHASE_LABELS[phase]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{LIFECYCLE_PHASE_DESCRIPTIONS[phase]}</p>
                <ul className="space-y-1">
                  {getPhaseGuidance(phase).map((g, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Methodologies & practices</h2>
        <div className="space-y-4">
          {PLAYBOOK_SECTIONS.filter((s) => s.id !== "product-lifecycle").map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{section.summary}</p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <p className="mb-2 font-medium">Principles</p>
                  <ul className="space-y-1">
                    {section.principles.map((p, i) => (
                      <li key={i} className="text-muted-foreground flex gap-2">
                        <span className="text-emerald-600">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium">Practices</p>
                  <ul className="space-y-1">
                    {section.practices.map((p, i) => (
                      <li key={i} className="text-muted-foreground flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium">Avoid</p>
                  <ul className="space-y-1">
                    {section.antiPatterns.map((p, i) => (
                      <li key={i} className="text-muted-foreground flex gap-2">
                        <XCircle className="mt-0.5 size-3 shrink-0 text-red-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-3 rounded-md border bg-muted/40 p-3">
                  <Badge variant="outline" className="mb-1">
                    Last Gate tip
                  </Badge>
                  <p className="text-sm">{section.platformTip}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Apply this on your apps: open an application → set lifecycle phase → use{" "}
        <Link href="/applications" className="text-emerald-600 underline">
          Tasks
        </Link>{" "}
        and Roadmap from the app menu.
      </p>
    </div>
  );
}
