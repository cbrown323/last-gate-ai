# Cursor agentic workflow guide — Foreman + Role Agents (Last Gate AI)

## Goal

Use **separate Cursor chats** (one Foreman plan, then one chat per role/task) so context stays small and file conflicts stay rare. Last Gate AI is **Next.js 15 + TypeScript** under `app/`, `components/`, `lib/`; workflow docs live in **`workflow_guide/`**; root [`AGENTS.md`](../AGENTS.md) summarizes rules.

---

## Prerequisites

1. **Repo layout**
   - [`workflow_guide/AI_PROJECT_STATE.md`](AI_PROJECT_STATE.md) — system map
   - [`workflow_guide/DEV_LOG.md`](DEV_LOG.md) — session history
   - [`workflow_guide/FOREMAN_MASTER_PROMPT.md`](FOREMAN_MASTER_PROMPT.md) — Foreman template
   - [`workflow_guide/AGENT_ROLES.md`](AGENT_ROLES.md) — Frontend, Backend, Integrations, Content, QA
   - [`AGENTS.md`](../AGENTS.md) at repo root — entry point
2. **Optional:** [`.cursor/rules/path-discipline.md`](../.cursor/rules/path-discipline.md)
3. **Cursor usage**
   - **Plan mode** — Foreman planning (no app code edits)
   - **Agent mode** — builders and doc updates
   - **Ask mode** — review-only

---

## First session (recommended)

1. **Foreman** — Plan mode, `@workflow_guide/FOREMAN_MASTER_PROMPT.md` + state + log
2. **One builder** — Agent mode, one Task capsule, 3–5 `@` files
3. **Merge** — Agent mode, update `DEV_LOG.md` + `AI_PROJECT_STATE.md`
4. **Commit** — checkpoint before parallel agents

---

## Phase 1: Foreman planning

1. New chat → **Plan mode**
2. Prompt:

   ```
   @workflow_guide/FOREMAN_MASTER_PROMPT.md
   @workflow_guide/AI_PROJECT_STATE.md
   @workflow_guide/DEV_LOG.md

   Produce shared contract and Task capsules per FOREMAN_MASTER_PROMPT.
   ```

3. Capture: shared contract, role-based capsules, sequence, risks
4. Apply shared contract in one Agent session
5. Close Foreman chat

---

## Phase 2: Builder execution

For each capsule from Foreman:

1. New chat → **Agent mode**
2. Use role template from [`COPY_PASTE_PROMPTS.md`](COPY_PASTE_PROMPTS.md)
3. `@` only verified paths (3–5 files)
4. Review diff → close chat

**Parallel agents:** only when Foreman marks disjoint file sets and after one clean cycle.

---

## Phase 3: Merge and document

1. `npm run dev` — run acceptance checks
2. Agent chat: update `workflow_guide/DEV_LOG.md` + `AI_PROJECT_STATE.md`
3. Commit

---

## Workflow diagram

```
Foreman (Plan) → shared contract + capsules
       ↓
Apply contract → commit
       ↓
Builders (Agent) — sequential first, parallel when safe
       ↓
npm run dev → merge docs → commit
```

---

## Common mistakes

1. Too many `@` files in one chat
2. Skipping Foreman — agents invent wrong paths
3. Parallel builders on overlapping `schema.prisma` / `types/`
4. Not updating state docs between sessions

---

## Quick start checklist

- [ ] Read [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md)
- [ ] Foreman (Plan) with state + log
- [ ] Apply contract, commit
- [ ] One builder cycle, then merge
- [ ] Update docs, commit

For copy-paste blocks, use [`COPY_PASTE_PROMPTS.md`](COPY_PASTE_PROMPTS.md).
