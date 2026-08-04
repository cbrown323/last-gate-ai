"use client";

import type { IntelligenceTabValue } from "@/components/applications/application-detail-tabs";
import { IntelligenceDetailTabs } from "@/components/applications/application-detail-tabs";
import { GitStatsPanel } from "@/components/applications/git-stats-panel";
import { AiSummaryPanel } from "@/components/applications/ai-summary-panel";
import { StackPanel } from "@/components/applications/stack-panel";
import { ArchitecturePanel } from "@/components/applications/architecture-panel";
import { SecurityPanel } from "@/components/applications/security-panel";
import { HeadroomPanel } from "@/components/applications/headroom-panel";
import { DeploymentsPanel } from "@/components/applications/deployments-panel";
import { TabsContent } from "@/components/ui/tabs";
import type { IntelligenceProgress } from "@/lib/applications/intelligence-workflow";
import { ArrowRight, Sparkles } from "lucide-react";
import type {
  ArchitectureMapResult,
  DeploymentRecord,
  GitMetadata,
  HeadroomReportResult,
  SecurityReportResult,
  StackScanResult,
} from "@/types";

export function ApplicationIntelligenceSection({
  applicationId,
  repoUrl,
  intelligenceTab,
  onIntelligenceTabChange,
  progress,
  analysisComplete,
  analysisCtaHint,
  stackScan,
  architectureMap,
  gitMeta,
  latestSummary,
  securityReport,
  headroomReport,
  deployments,
}: {
  applicationId: string;
  repoUrl: string | null;
  intelligenceTab: IntelligenceTabValue;
  onIntelligenceTabChange: (tab: IntelligenceTabValue) => void;
  progress: IntelligenceProgress;
  analysisComplete: boolean;
  analysisCtaHint: string | null;
  stackScan: StackScanResult | null;
  architectureMap: ArchitectureMapResult | null;
  gitMeta: GitMetadata | null;
  latestSummary: { content: string; generatedAt: string } | null;
  securityReport: SecurityReportResult | null;
  headroomReport: HeadroomReportResult | null;
  deployments: DeploymentRecord[];
}) {
  const summaryPending = progress.summary === "pending";

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 shrink-0 text-emerald-600" />
          Explore each section below
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Sub-tabs let you view or run one step at a time (e.g.{" "}
          <span className="font-medium text-foreground">Generate</span> on AI Summary). To run every
          step in order, use{" "}
          <span className="font-medium text-foreground">Run full analysis</span> in the green card
          above.
        </p>
        {analysisCtaHint ? (
          <p className="text-muted-foreground mt-2 text-xs">{analysisCtaHint}</p>
        ) : null}
        {summaryPending ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Quick AI only? Open{" "}
            <button
              type="button"
              onClick={() => onIntelligenceTabChange("summary")}
              className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-300"
            >
              AI Summary
            </button>{" "}
            and click Generate
            <ArrowRight className="ml-0.5 inline size-3.5" />
          </p>
        ) : null}
        {!analysisComplete ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Amber dots on sub-tabs mark sections not run yet. Green checks mean data is ready.
          </p>
        ) : null}
      </div>

      <IntelligenceDetailTabs
        tab={intelligenceTab}
        onTabChange={onIntelligenceTabChange}
        progress={progress}
        repoUrl={repoUrl}
      >
      <TabsContent value="stack" className="mt-3">
        <StackPanel applicationId={applicationId} repoUrl={repoUrl} initialScan={stackScan} />
      </TabsContent>
      <TabsContent value="architecture" className="mt-3">
        <ArchitecturePanel
          applicationId={applicationId}
          repoUrl={repoUrl}
          initialMap={architectureMap}
        />
      </TabsContent>
      <TabsContent value="git" className="mt-3">
        <GitStatsPanel applicationId={applicationId} gitMeta={gitMeta} repoUrl={repoUrl} />
      </TabsContent>
      <TabsContent value="summary" className="mt-3">
        <AiSummaryPanel applicationId={applicationId} latestSummary={latestSummary} />
      </TabsContent>
      <TabsContent value="security" className="mt-3">
        <SecurityPanel applicationId={applicationId} latestReport={securityReport} />
      </TabsContent>
      <TabsContent value="headroom" className="mt-3">
        <HeadroomPanel applicationId={applicationId} latestReport={headroomReport} />
      </TabsContent>
      <TabsContent value="deployments" className="mt-3">
        <DeploymentsPanel
          applicationId={applicationId}
          repoUrl={repoUrl}
          initialDeployments={deployments}
        />
      </TabsContent>
    </IntelligenceDetailTabs>
    </div>
  );
}
