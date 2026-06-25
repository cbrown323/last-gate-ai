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
    title: "Read your two docs first",
    icon: BookMarked,
    theme: "sky",
    summary:
      "Every session starts by re-reading the system map and the dev log. That's the whole memory of the project — open them before you write a single line.",
    points: [
      "A system map: stack, directory layout, data model, known issues.",
      "A dev log: what changed last session, decisions made, follow-ups.",
      "Attach both to the chat so the agent isn't guessing at your codebase.",
    ],
  },
  {
    step: "2",
    title: "Plan only when it's fuzzy",
    icon: PencilRuler,
    theme: "violet",
    summary:
      "If the change is obvious, just build it. If the scope is unclear or touches the schema, drop into Plan mode and sketch the contract first.",
    points: [
      "Small, clear change → skip straight to building.",
      "New model, new API surface, or cross-cutting change → plan it first.",
      "Lock the TypeScript types / Prisma shape before touching downstream code.",
    ],
  },
  {
    step: "3",
    title: "Build in one focused session",
    icon: Hammer,
    theme: "amber",
    summary:
      "One chat, one chunk of work — a phase, a feature, a fix. Attach only the few files it touches and let the agent do the edit.",
    points: [
      "Scope a session to something you can finish and verify in one sitting.",
      "Attach 3–5 real, verified paths — not the whole tree.",
      "Keep edits surgical; don't let it refactor unrelated code.",
    ],
  },
  {
    step: "4",
    title: "Verify before you trust it",
    icon: ShieldCheck,
    theme: "emerald",
    summary:
      "Run the build and click through the actual flow. \"It compiled\" is not \"it works.\" This is the step vibe coders skip and then can't debug.",
    points: [
      "Run npm run build — catch type errors before they pile up.",
      "Run npm run dev and walk the real user flow you just changed.",
      "If it breaks, fix it now while the context is still in the chat.",
    ],
  },
  {
    step: "5",
    title: "Log it and commit",
    icon: Save,
    theme: "teal",
    summary:
      "Write a few lines in the dev log — completed, decisions, follow-ups — then commit a clean checkpoint. Future-you (and any agent) reads this next time.",
    points: [
      "Note what you finished, what you decided, and what's still open.",
      "Park ideas you can't do now in a Deferred / Known-debt list — don't lose them.",
      "Commit with a clear message so each session is a recoverable checkpoint.",
    ],
  },
];

const habits = [
  "Treat the dev log + system map as the project's brain. If it's not written down, it doesn't exist next session.",
  "One session = one finishable chunk. When the chat gets long or loses the thread, commit and start fresh.",
  "Verify with a build and a real click-through every time — not just when something feels off.",
  "Park what you can't do now. A written 'Deferred' line beats a half-built feature you forgot about.",
];

const mistakes = [
  "Building for hours in one giant chat until the model forgets your codebase.",
  "Skipping the build/click-through, so bugs stack up and become untraceable.",
  "Never writing anything down — every session restarts from zero context.",
  "Letting the agent rewrite unrelated files because the scope was never set.",
];

export default function SoloOperatorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Solo Operator workflow"
        description="How to structure development when you're the whole team — a lightweight loop you can actually run on every change."
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
              read your docs, work in focused sessions, verify, then log and commit.
            </strong>{" "}
            That&rsquo;s the loop below.
          </p>
          <p>
            The reason most &ldquo;vibe coders&rdquo; get stuck isn&rsquo;t a lack of process — it&rsquo;s
            no written memory and no verification. Fix those two things and you can debug your own
            work and explain it to anyone.
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
            When to escalate to the multi-agent setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            The full Foreman + role-agents workflow (plan in one chat, split builders by role) is
            real, but it&rsquo;s overkill for day-to-day work. Reach for it{" "}
            <strong className="text-foreground">only</strong> when a feature is big enough to span
            clearly separate areas — say frontend, API, and schema — and you&rsquo;ve already proven
            the change with one clean session.
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
