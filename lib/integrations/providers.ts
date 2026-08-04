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
        title: "Create a personal access token",
        description:
          "Open GitHub → Settings → Developer settings → Personal access tokens. Use fine-grained or classic token with repo read access.",
        link: {
          label: "Create token on GitHub",
          href: "https://github.com/settings/tokens?type=beta",
        },
      },
      {
        title: "Save the token in API keys",
        description:
          "In the API keys section above, paste your token into GitHub token and click Save. Restart npm run dev if Re-check still fails.",
      },
      {
        title: "Confirm and add an application",
        description:
          "Click Re-check below to verify the token. Then open Applications and use Import from GitHub or Add application.",
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
          "Paste your key in the API keys section above and click Save. Restart npm run dev if features do not update immediately.",
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
          "Paste the token in the API keys section above as Railway token and click Save. Restart npm run dev, then Re-check below.",
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
