# Last Gate AI agentic workflow — quick reference

## First session rule

**One Foreman (Plan)** → **one Builder (Agent)** → **one merge (Agent)** → **commit**. Parallel agents only after a clean cycle and disjoint file sets.

---

## The three phases

### 1. Foreman (planning)

Plan mode → `@workflow_guide/FOREMAN_MASTER_PROMPT.md` + `@workflow_guide/AI_PROJECT_STATE.md` + `@workflow_guide/DEV_LOG.md` → save plan → apply contract → close.

### 2. Builders (execution)

Per Task capsule: Agent mode → `@AGENTS.md` + role from `@workflow_guide/AGENT_ROLES.md` → `@` 3–5 verified files → close.

### 3. Merge (documentation)

Agent mode → `@workflow_guide/DEV_LOG.md` + `@workflow_guide/AI_PROJECT_STATE.md` → sync → commit.

---

## Agent roles

| Role | Owns |
|------|------|
| Foreman | Plan only — types, capsules |
| Frontend | `app/(dashboard)/**`, `components/**`, `hooks/**` |
| Backend | `app/api/**`, `lib/db.ts`, `prisma/**` |
| Integrations | `lib/github/**`, sync routes |
| Content | Copy, empty states, tooltips |
| QA | `__tests__/**`, review |

---

## Rules

**Do:** `@` 3–5 files, close chats, update state docs, `npm run dev` before commit.

**Don't:** skip Foreman, parallel on overlapping files, assume Vite/Laravel paths.

---

## File hierarchy

```
last-gate-ai/
├── AGENTS.md
├── workflow_guide/
│   ├── AI_PROJECT_STATE.md
│   ├── DEV_LOG.md
│   ├── AGENTS.md
│   ├── FOREMAN_MASTER_PROMPT.md
│   ├── AGENT_ROLES.md
│   ├── COPY_PASTE_PROMPTS.md
│   ├── CURSOR_WORKFLOW_GUIDE.md
│   ├── QUICK_REFERENCE.md
│   └── VISUAL_WORKFLOW.md
├── app/
├── components/
├── lib/
├── prisma/
└── types/
```

---

## Next session startup

1. Read `@workflow_guide/AI_PROJECT_STATE.md`
2. Read `@workflow_guide/DEV_LOG.md`
3. New Foreman if scope changed
4. Builder chats from fresh capsules
