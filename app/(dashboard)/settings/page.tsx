import { PageHeader } from "@/components/layout/page-header";
import { ApiKeysPanel } from "@/components/settings/api-keys-panel";
import { IntegrationsWizard } from "@/components/settings/integrations-wizard";
import { SettingsDocumentationCard } from "@/components/settings/settings-documentation-card";

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Connect GitHub, deployment platforms, and AI in one guided flow"
      />
      <ApiKeysPanel />
      <IntegrationsWizard />
      <SettingsDocumentationCard title="Environment reference" expandLabel="View variables">
        <p>
          In local development, use the <strong className="font-medium text-foreground">API keys</strong>{" "}
          section above (saved to{" "}
          <code className="rounded bg-muted px-1">.env.local</code>). Or copy{" "}
          <code className="rounded bg-muted px-1">.env.example</code> to{" "}
          <code className="rounded bg-muted px-1">.env.local</code> manually and restart{" "}
          <code className="rounded bg-muted px-1">npm run dev</code> after changes.
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li><code>DATABASE_URL</code>: SQLite path (default: file:./dev.db)</li>
          <li><code>GITHUB_TOKEN</code>: GitHub PAT for repo sync</li>
          <li><code>AI_GATEWAY_API_KEY</code> or <code>OPENAI_API_KEY</code>: AI features</li>
          <li><code>VERCEL_TOKEN</code>: optional, Vercel API access</li>
          <li><code>RAILWAY_TOKEN</code>: optional, Railway API access</li>
        </ul>
      </SettingsDocumentationCard>
    </div>
  );
}