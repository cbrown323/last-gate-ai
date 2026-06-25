export type IntegrationProviderId =
  | "github"
  | "ai"
  | "vercel"
  | "railway";

export type IntegrationConnectionState =
  | "not_configured"
  | "configured"
  | "verified"
  | "error";

export interface IntegrationSetupStep {
  title: string;
  description: string;
  link?: { label: string; href: string };
}

export interface IntegrationProviderDefinition {
  id: IntegrationProviderId;
  name: string;
  description: string;
  envVars: string[];
  optional: boolean;
  setupSteps: IntegrationSetupStep[];
  docsUrl: string;
  features: string[];
}

export interface IntegrationProviderStatus {
  id: IntegrationProviderId;
  state: IntegrationConnectionState;
  configured: boolean;
  verified: boolean;
  message: string | null;
  accountLabel: string | null;
  envVars: string[];
  missingEnvVars: string[];
}

export interface IntegrationsOverview {
  providers: IntegrationProviderStatus[];
  readyCount: number;
  totalCount: number;
  coreReady: boolean;
}
