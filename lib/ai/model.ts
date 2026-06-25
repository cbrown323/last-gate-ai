import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getAiConfig } from "@/lib/ai/config";

export function getSummaryModel(): LanguageModel | null {
  const config = getAiConfig();
  if (!config.configured) return null;

  if (config.provider === "openai") {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(config.model);
  }

  return `openai/${config.model}`;
}
