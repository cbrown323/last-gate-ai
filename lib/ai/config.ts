export type AiProvider = "gateway" | "openai";

export type AiConfig = {
  configured: boolean;
  provider: AiProvider | null;
  model: string;
};

const SUMMARY_MODEL = "gpt-4o-mini";

export function getAiConfig(): AiConfig {
  if (process.env.AI_GATEWAY_API_KEY) {
    return { configured: true, provider: "gateway", model: SUMMARY_MODEL };
  }
  if (process.env.OPENAI_API_KEY) {
    return { configured: true, provider: "openai", model: SUMMARY_MODEL };
  }
  return { configured: false, provider: null, model: SUMMARY_MODEL };
}
