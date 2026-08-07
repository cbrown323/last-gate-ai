import type { IntegrationProviderDefinition } from "@/types/integrations";

export const INTEGRATION_PROVIDERS: IntegrationProviderDefinition[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repos, scan stack, map architecture, and detect deployment configs.",
    envVars: ["GITHUB_TOKEN"],
    optional: false,
    docsUrl: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
    features: ["Repo sync", "Stack scan", "Architecture map", "Deployment detection"],
    setupSteps: [
      {
        title: "Create a GitHub Personal Access Token (required for private repos)",
        description:
          "Open GitHub → Settings → Developer settings → Personal access tokens. Fine-grained token: under Repository access select your repos (or all), then set Contents: Read and Metadata: Read. Classic token: select the repo scope. For org-owned private repos, also authorize the token for the org via SSO after creating it.",
        link: {
          label: "Create fine-grained token on GitHub",
          href: "https://github.com/settings/tokens?type=beta",
        },
      },
      {
        title: "Save the token below",
        description:
          "Paste the token into the field below and click Save. It's saved to .env.local and active immediately — no restart needed. Restart npm run dev only if Re-check still fails.",
      },
      {
        title: "Confirm and add an application",
        description:
          "Click Re-check below to verify the token, and optionally test access to a specific private repo. Then open Applications and use Import from GitHub or Add application.",
      },
    ],
  },
  {
    id: "ai",
    name: "AI (Vercel Gateway or OpenAI)",
    description: "Generate live project summaries, security insights, and headroom reports.",
    envVars: ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY"],
    optional: true,
    docsUrl: "https://vercel.com/docs/ai-gateway",
    features: ["AI summaries", "Security agent", "Headroom agent"],
    setupSteps: [
      {
        title: "Choose a provider",
        description:
          "Recommended: Vercel AI Gateway (AI_GATEWAY_API_KEY). Alternative: direct OpenAI (OPENAI_API_KEY). Set only one.",
        link: {
          label: "AI Gateway docs",
          href: "https://vercel.com/docs/ai-gateway",
        },
      },
      {
        title: "Save the key in API keys",
        description:
          "Paste your key in the API keys section above and click Save. Keys are active immediately — restart npm run dev only if features do not update.",
      },
      {
        title: "Test on any application",
        description:
          "Open an application → Intelligence → AI Summary and click Generate.",
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Link deployments, pull env vars, and track production URLs per project.",
    envVars: ["VERCEL_TOKEN"],
    optional: true,
    docsUrl: "https://vercel.com/docs/rest-api",
    features: ["Deployment status", "Project linking", "Env sync (CLI)"],
    setupSteps: [
      {
        title: "Install and link the Vercel CLI",
        description: "Run vercel login and vercel link in your project root to connect the repo.",
        link: {
          label: "Vercel CLI docs",
          href: "https://vercel.com/docs/cli",
        },
      },
      {
        title: "Save the token in API keys",
        description:
          "Vercel dashboard → Settings → Tokens. Paste the token in the API keys section above as Vercel token and click Save.",
        link: {
          label: "Create Vercel token",
          href: "https://vercel.com/account/settings/tokens",
        },
      },
      {
        title: "Connect your app",
        description:
          "Set websiteUrl on your application or log a deployment under Intelligence → Deployments. Last Gate auto-detects vercel.json in the repo.",
      },
    ],
  },
  {
    id: "railway",
    name: "Railway",
    description: "Track Railway deployments and detect railway.toml in connected repos.",
    envVars: ["RAILWAY_TOKEN"],
    optional: true,
    docsUrl: "https://docs.railway.com/reference/public-api",
    features: ["Deployment detection", "Platform tracking"],
    setupSteps: [
      {
        title: "Create a Railway API token",
        description: "Railway dashboard → Account Settings → Tokens.",
        link: {
          label: "Railway account tokens",
          href: "https://railway.com/account/tokens",
        },
      },
      {
        title: "Save the token in API keys",
        description:
          "Paste the token in the API keys section above as Railway token and click Save, then Re-check below. Keys are active immediately.",
      },
      {
        title: "Detect from repo",
        description:
          "On your application → Intelligence → Deployments → Detect from repo. Last Gate finds railway.toml automatically.",
      },
    ],
  },
];

export function getProviderDefinition(id: string) {
  return INTEGRATION_PROVIDERS.find((p) => p.id === id);
}
