export type EnvKeyId =
  | "GITHUB_TOKEN"
  | "AI_GATEWAY_API_KEY"
  | "OPENAI_API_KEY"
  | "VERCEL_TOKEN"
  | "RAILWAY_TOKEN";

export interface EnvKeyDefinition {
  id: EnvKeyId;
  label: string;
  description: string;
  placeholder: string;
  group: "github" | "ai" | "vercel" | "railway";
  optional?: boolean;
}

export const MANAGEABLE_ENV_KEYS: EnvKeyDefinition[] = [
  {
    id: "GITHUB_TOKEN",
    label: "GitHub Personal Access Token",
    description:
      "Grants access to public and private repos you can read. Classic: repo scope. Fine-grained: Contents + Metadata read on your repos.",
    placeholder: "ghp_… or github_pat_…",
    group: "github",
  },
  {
    id: "AI_GATEWAY_API_KEY",
    label: "Vercel AI Gateway key",
    description: "Recommended for AI summaries and agents.",
    placeholder: "vck_…",
    group: "ai",
    optional: true,
  },
  {
    id: "OPENAI_API_KEY",
    label: "OpenAI API key",
    description: "Alternative to AI Gateway. Set only one AI key.",
    placeholder: "sk-…",
    group: "ai",
    optional: true,
  },
  {
    id: "VERCEL_TOKEN",
    label: "Vercel token",
    description: "Optional. Deployment API access and verification.",
    placeholder: "vercel_…",
    group: "vercel",
    optional: true,
  },
  {
    id: "RAILWAY_TOKEN",
    label: "Railway token",
    description: "Optional. Railway deployment API access.",
    placeholder: "railway_…",
    group: "railway",
    optional: true,
  },
];

export const MANAGEABLE_ENV_KEY_IDS = MANAGEABLE_ENV_KEYS.map((k) => k.id);
