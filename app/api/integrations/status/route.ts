import { NextResponse } from "next/server";
import { getIntegrationsOverview } from "@/lib/integrations/status";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations/providers";

export async function GET() {
  const overview = await getIntegrationsOverview({ verify: false });
  return NextResponse.json({
    ...overview,
    providers: overview.providers.map((status) => {
      const def = INTEGRATION_PROVIDERS.find((p) => p.id === status.id)!;
      return { ...status, ...def };
    }),
  });
}
