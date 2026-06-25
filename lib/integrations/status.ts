import { getAiConfig } from "@/lib/ai/config";
import type {
  IntegrationConnectionState,
  IntegrationProviderId,
  IntegrationProviderStatus,
  IntegrationsOverview,
} from "@/types/integrations";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations/providers";
import { verifyProvider } from "@/lib/integrations/verify";

function envConfigured(envVars: string[]): {
  configured: boolean;
  missingEnvVars: string[];
} {
  if (envVars.length === 1) {
    const set = Boolean(process.env[envVars[0]]?.trim());
    return {
      configured: set,
      missingEnvVars: set ? [] : envVars,
    };
  }

  // AI: any one of the listed vars satisfies configuration
  const anySet = envVars.some((v) => Boolean(process.env[v]?.trim()));
  return {
    configured: anySet,
    missingEnvVars: anySet ? [] : envVars,
  };
}

function resolveState(
  configured: boolean,
  verified: boolean,
  hadError: boolean
): IntegrationConnectionState {
  if (hadError) return "error";
  if (verified) return "verified";
  if (configured) return "configured";
  return "not_configured";
}

async function buildProviderStatus(
  id: IntegrationProviderId,
  options?: { verify?: boolean }
): Promise<IntegrationProviderStatus> {
  const def = INTEGRATION_PROVIDERS.find((p) => p.id === id)!;
  const { configured, missingEnvVars } = envConfigured(def.envVars);

  let verified = false;
  let message: string | null = null;
  let accountLabel: string | null = null;
  let hadError = false;

  if (options?.verify && configured) {
    const result = await verifyProvider(id);
    verified = result.ok;
    message = result.message;
    accountLabel = result.accountLabel;
    hadError = !result.ok;
  } else if (configured && id === "ai") {
    const config = getAiConfig();
    message = `Using ${config.provider} (${config.model})`;
    accountLabel = config.provider;
    verified = true;
  } else if (!configured) {
    message =
      def.envVars.length === 1
        ? `Add ${def.envVars[0]} to .env.local`
        : `Add one of: ${def.envVars.join(" or ")}`;
  }

  return {
    id,
    state: resolveState(configured, verified, hadError),
    configured,
    verified,
    message,
    accountLabel,
    envVars: def.envVars,
    missingEnvVars,
  };
}

export async function getIntegrationsOverview(options?: {
  verify?: boolean;
}): Promise<IntegrationsOverview> {
  const providers = await Promise.all(
    INTEGRATION_PROVIDERS.map((p) =>
      buildProviderStatus(p.id, { verify: options?.verify })
    )
  );

  const readyCount = providers.filter((p) => p.verified || p.configured).length;
  const github = providers.find((p) => p.id === "github");

  return {
    providers,
    readyCount,
    totalCount: providers.length,
    coreReady: Boolean(github?.configured),
  };
}

export function isIntegrationConfigured(id: IntegrationProviderId): boolean {
  const def = INTEGRATION_PROVIDERS.find((p) => p.id === id);
  if (!def) return false;
  return envConfigured(def.envVars).configured;
}
