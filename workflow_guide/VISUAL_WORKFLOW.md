# Last Gate AI Cursor workflow — visual overview

Prompts and state live under **`workflow_guide/`**. Root [`AGENTS.md`](../AGENTS.md) points to full rules.

---

## Visual flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Repo has workflow_guide/*.md + root AGENTS.md      │
│  Optional: .cursor/rules/path-discipline.md                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Foreman (1 chat, Plan mode)                        │
│  Output: shared contract + role-based Task capsules         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3a: FIRST SESSION — one builder (Agent mode)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3b: LATER — parallel builders (disjoint files only)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Merge docs (Agent) → DEV_LOG + AI_PROJECT_STATE    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: npm run dev → git commit                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent flow

```
USER request
    ↓
FOREMAN (Plan) ──→ Shared Contract + Task Capsules
    ↓
┌──────────┬──────────┬──────────────┬─────────┐
│ Frontend │ Backend  │ Integrations │ Content │
└──────────┴──────────┴──────────────┴─────────┘
    ↓
QA (review)
    ↓
Merge docs → Commit
```

---

## Modes

| Mode | Use |
|------|-----|
| Plan | Foreman — no code |
| Agent | Builders, contract, docs |
| Ask | Read-only review |

---

## Ready to start

1. [`COPY_PASTE_PROMPTS.md`](COPY_PASTE_PROMPTS.md) — TAB 1 Foreman
2. Builders per role capsules
3. TAB 7 documentation merge
