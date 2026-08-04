import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plug } from "lucide-react";
import { isIntegrationConfigured } from "@/lib/integrations/status";

export function IntegrationsSetupBanner() {
  const githubReady = isIntegrationConfigured("github");

  if (githubReady) return null;

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Plug className="size-4 text-amber-600" />
            <p className="font-medium">Connect your integrations</p>
          </div>
          <p className="text-muted-foreground text-sm">
            Link GitHub, Vercel, Railway, and AI in a guided setup to sync repos and run live
            intelligence.
          </p>
        </div>
        <Link
          href="/settings"
          className={cn(buttonVariants({ size: "sm" }), "shrink-0 bg-emerald-600 hover:bg-emerald-700")}
        >
          Open setup wizard
        </Link>
      </div>
    </div>
  );
}
