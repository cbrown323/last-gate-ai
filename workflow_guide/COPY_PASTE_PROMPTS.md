# COPY-PASTE PROMPTS — Last Gate AI workflow (Cursor)

**How to use:** Open a **new Cursor chat** for each tab below. Use **Plan mode** for TAB 1 (Foreman). Use **Agent mode** for builder and documentation tabs. If you do not have a Foreman plan yet, **stop** — run TAB 1 first.

**Paths:** Workflow docs live under `workflow_guide/`. Root [`AGENTS.md`](../AGENTS.md) points here.

---

## TAB 1: FOREMAN (planning phase)

**Action:** New chat → **Plan mode** → paste → Enter.

```
@workflow_guide/FOREMAN_MASTER_PROMPT.md
@workflow_guide/AI_PROJECT_STATE.md
@workflow_guide/DEV_LOG.md

You are the Project Foreman for Last Gate AI. Read the context files and create an implementation plan for Phase 1 MVP:

1. Project registry (CRUD applications)
2. GitHub integration (sync metadata)
3. Kanban tasks (4-column board per app)
4. AI summary generator
5. Portfolio dashboard
6. Admin shell (Soccer-inspired + Figma routes)

Provide:
- Shared contract (TypeScript types + Prisma schema boundaries)
- Task capsules per AGENT_ROLES (Frontend, Backend, Integrations, Content, QA)
- Implementation sequence
- File conflict prevention strategy

Do not write application code — planning only.
```

---

## TAB 2: FRONTEND BUILDER

**Action:** New chat → **Agent mode** → paste Foreman Frontend capsule.

```
@AGENTS.md
@workflow_guide/AI_PROJECT_STATE.md
@workflow_guide/AGENT_ROLES.md

ROLE: Frontend Developer for Last Gate AI

TASK: <paste Frontend task from Foreman>

Context (from Foreman Task capsule):
- Repo-relative paths (verified): <paste>
- Forbidden paths: <paste>
- Dependencies / merge order: <paste>
- Acceptance check (manual): <paste>

ONLY modify files listed. Use shadcn/ui + Server Components by default.
End with: Modified files | Testing done | Known limitations
```

---

## TAB 3: BACKEND BUILDER

```
@AGENTS.md
@workflow_guide/AI_PROJECT_STATE.md
@workflow_guide/AGENT_ROLES.md

ROLE: Backend Developer for Last Gate AI

TASK: <paste Backend task from Foreman>

Context: <paste capsule fields>

ONLY touch app/api/**, lib/**, prisma/** as specified.
End with: Modified files | Testing done | Known limitations
```

---

## TAB 4: INTEGRATIONS BUILDER

```
@AGENTS.md
@workflow_guide/AI_PROJECT_STATE.md
@workflow_guide/AGENT_ROLES.md

ROLE: Integrations Developer for Last Gate AI

TASK: <paste Integrations task from Foreman>

Context: <paste capsule fields>

Focus: lib/github/**, GitHub API, env vars. Never expose tokens to client.
End with: Modified files | Testing done | Known limitations
```

---

## TAB 5: CONTENT AGENT

```
@AGENTS.md
@workflow_guide/AI_PROJECT_STATE.md

ROLE: Content Agent for Last Gate AI

TASK: <paste Content task from Foreman>

Focus: UI copy, empty states, tooltips, meta tags. No API logic changes.
```

---

## TAB 6: QA AGENT

```
@AGENTS.md
@workflow_guide/AI_PROJECT_STATE.md

ROLE: QA Agent for Last Gate AI

TASK: <paste QA task from Foreman>

Provide: test cases run, bugs found, performance notes.
```

---

## TAB 7: DOCUMENTATION UPDATE (merge phase)

```
@workflow_guide/DEV_LOG.md
@workflow_guide/AI_PROJECT_STATE.md

Completed work:
- <list what shipped>

Please:
1. Update DEV_LOG.md with today's work and follow-ups
2. Update AI_PROJECT_STATE.md (module checklist, known issues)
3. Move completed items to done; note new issues
```

**After:** `npm run dev` → verify → `git commit` when ready.

---

## Quick execution guide

1. TAB 1 Foreman (Plan) → save capsules
2. Apply shared contract → commit
3. TAB 2–6 builders (Agent), one at a time first session
4. TAB 7 merge docs
5. Test and commit
