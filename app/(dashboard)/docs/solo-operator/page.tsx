import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Compass,
  BookMarked,
  PencilRuler,
  Hammer,
  ShieldCheck,
  Save,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
} from "lucide-react";

const loopThemes = {
  sky: {
    card: "border-sky-200/70 border-l-sky-500 bg-sky-50/50 shadow-sm dark:border-sky-900/50 dark:border-l-sky-400 dark:bg-sky-950/25",
    badge: "bg-sky-600 text-white shadow-sm dark:bg-sky-500",
    icon: "text-sky-600 dark:text-sky-400",
    bullet: "text-sky-600 dark:text-sky-400",
    summary: "text-sky-950/80 dark:text-sky-100/90",
    point: "text-sky-950/90 dark:text-sky-50/90",
  },
  violet: {
    card: "border-violet-200/70 border-l-violet-500 bg-violet-50/50 shadow-sm dark:border-violet-900/50 dark:border-l-violet-400 dark:bg-violet-950/25",
    badge: "bg-violet-600 text-white shadow-sm dark:bg-violet-500",
    icon: "text-violet-600 dark:text-violet-400",
    bullet: "text-violet-600 dark:text-violet-400",
    summary: "text-violet-950/80 dark:text-violet-100/90",
    point: "text-violet-950/90 dark:text-violet-50/90",
  },
  amber: {
    card: "border-amber-200/70 border-l-amber-500 bg-amber-50/50 shadow-sm dark:border-amber-900/50 dark:border-l-amber-400 dark:bg-amber-950/25",
    badge: "bg-amber-600 text-white shadow-sm dark:bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    bullet: "text-amber-600 dark:text-amber-400",
    summary: "text-amber-950/80 dark:text-amber-100/90",
    point: "text-amber-950/90 dark:text-amber-50/90",
  },
  emerald: {
    card: "border-emerald-200/70 border-l-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-900/50 dark:border-l-emerald-400 dark:bg-emerald-950/25",
    badge: "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    bullet: "text-emerald-600 dark:text-emerald-400",
    summary: "text-emerald-950/80 dark:text-emerald-100/90",
    point: "text-emerald-950/90 dark:text-emerald-50/90",
  },
  teal: {
    card: "border-teal-200/70 border-l-teal-500 bg-teal-50/50 shadow-sm dark:border-teal-900/50 dark:border-l-teal-400 dark:bg-teal-950/25",
    badge: "bg-teal-600 text-white shadow-sm dark:bg-teal-500",
    icon: "text-teal-600 dark:text-teal-400",
    bullet: "text-teal-600 dark:text-teal-400",
    summary: "text-teal-950/80 dark:text-teal-100/90",
    point: "text-teal-950/90 dark:text-teal-50/90",
  },
} as const;

type LoopTheme = keyof typeof loopThemes;

const loop: {
  step: string;
  title: string;
  icon: typeof BookMarked;
  theme: LoopTheme;
  summary: string;
  points: string[];
}[] = [
  {
    step: "1",
    title: "Start from written memory",
    icon: BookMarked,
    theme: "sky",
    summary:
      "Every session starts from durable context: the agent rules file, the system map, and the dev log. That written memory is what the agent reads instead of guessing at your codebase.",
    points: [
      "Keep an AGENTS.md rules file current so every session inherits your conventions automatically.",
      "A system map: stack, directory layout, data model, known issues.",
      "A dev log: what changed last session, decisions made, open follow-ups.",
    ],
  },
  {
    step: "2",
    title: "Plan only when it's fuzzy",
    icon: PencilRuler,
    theme: "violet",
    summary:
      "If the change is obvious, just build it. If the scope is unclear, touches the schema, or has real trade-offs, run a planning pass and agree on the approach before any code is written.",
    points: [
      "Small, clear change: skip straight to building.",
      "New model, new API surface, or cross-cutting change: write the plan or spec first.",
      "Lock the contract (TypeScript types, Prisma shape, API routes) before touching downstream code.",
    ],
  },
  {
    step: "3",
    title: "Delegate outcomes, not keystrokes",
    icon: Hammer,
    theme: "amber",
    summary:
      "One session, one finishable chunk of work. State the goal and the acceptance criteria, then let the agent search the codebase and make the edits. Modern agents find the right files better than a pasted file list.",
    points: [
      "Scope a session to something you can finish and review in one sitting.",
      "Describe what done looks like, including how to verify it.",
      "Set boundaries up front: name the files or areas the agent must not touch.",
    ],
  },
  {
    step: "4",
    title: "Verify with evidence, then review the diff",
    icon: ShieldCheck,
    theme: "emerald",
    summary:
      "Make the agent prove its own work: run the build, run the checks, walk the flow. Then read the diff yourself. \"It compiled\" is not \"it works,\" and a summary is not a review.",
    points: [
      "Have the agent run npm run build and fix what breaks while the context is hot.",
      "Walk the real user flow you just changed before trusting it.",
      "Review the actual diff before committing. You are the editor, not a spectator.",
    ],
  },
  {
    step: "5",
    title: "Log it and commit",
    icon: Save,
    theme: "teal",
    summary:
      "Write a few lines in the dev log (completed, decisions, follow-ups), then commit a small, reviewable checkpoint. Future sessions, human or agent, start from this.",
    points: [
      "Note what you finished, what you decided, and what's still open.",
      "Park ideas you can't do now in a Deferred / Known-debt list so they aren't lost.",
      "Commit small and often; every clean checkpoint is a recovery point.",
    ],
  },
];

const habits = [
  "Treat AGENTS.md, the system map, and the dev log as the project's brain. If it's not written down, it doesn't exist next session.",
  "One session, one finishable chunk. When the chat gets long or loses the thread, commit and start fresh.",
  "Verify with a build and a real click-through every time, and read the diff before you commit.",
  "Feed corrections back into the rules file. If you fix the same agent mistake twice, it belongs in AGENTS.md.",
];

const mistakes = [
  "Building for hours in one giant chat until the model loses track of your codebase.",
  "Accepting the agent's summary without reading the diff or running the app.",
  "Never writing anything down, so every session restarts from zero context.",
  "Letting the agent rewrite unrelated files because the scope was never set.",
];

export default function SoloOperatorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Solo Operator workflow"
        description="How to structure development when you're the whole team: a lightweight agentic loop you can actually run on every change."
      />

      <Card className="border-sky-200/50 bg-sky-50/20 dark:bg-sky-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="size-4 text-sky-600" />
            Keep it realistic
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            You don&rsquo;t need a six-agent org chart to ship. What actually keeps a solo project
            from collapsing is boring and repeatable:{" "}
            <strong className="text-foreground">
              give the agent written memory, delegate outcomes in focused sessions, verify with
              evidence, then log and commit.
            </strong>{" "}
            That&rsquo;s the loop below.
          </p>
          <p>
            The reason most &ldquo;vibe coders&rdquo; get stuck isn&rsquo;t a lack of process.
            It&rsquo;s no written memory and no verification. Fix those two things and you can
            debug your own work and explain it to anyone.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">The everyday loop</h2>
        <div className="space-y-4">
          {loop.map((item) => {
            const theme = loopThemes[item.theme];
            return (
              <Card key={item.step} className={cn("border-l-4", theme.card)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        theme.badge
                      )}
                    >
                      {item.step}
                    </span>
                    <item.icon className={cn("size-5", theme.icon)} />
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                  <p className={cn("text-sm leading-relaxed", theme.summary)}>{item.summary}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {item.points.map((p, i) => (
                      <li key={i} className="flex gap-2.5">
                        <CheckCircle2
                          className={cn("mt-0.5 size-4 shrink-0", theme.bullet)}
                        />
                        <span className={cn("leading-relaxed", theme.point)}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Habits that hold it together
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {habits.map((h, i) => (
                <li key={i} className="text-muted-foreground flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="size-4 text-red-500" />
              What actually goes wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {mistakes.map((m, i) => (
                <li key={i} className="text-muted-foreground flex gap-2">
                  <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-amber-600" />
            When to scale beyond one agent
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Parallel and background agents are real, but they&rsquo;re overkill for day-to-day
            work. Reach for them <strong className="text-foreground">only</strong> when a feature
            spans clearly separate areas (say frontend, API, and schema), keep their file sets
            disjoint, and serialize anything that touches shared contracts like the Prisma schema
            or shared types. A separate review pass on the final diff is cheap insurance.
          </p>
          <p>
            For 90% of solo work, the five-step loop above is the whole system. Don&rsquo;t add
            ceremony you won&rsquo;t keep up.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Pair this with methodology guidance in the{" "}
            <Link href="/playbook" className="text-sky-600 underline">
              PM Playbook
            </Link>{" "}
            to run each application through its lifecycle.
          </p>
          <Link
            href="/playbook"
            className="text-sky-600 inline-flex items-center gap-1 font-medium"
          >
            Open PM Playbook
            <ArrowRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
