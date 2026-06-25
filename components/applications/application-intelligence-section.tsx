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
  stackScan: StackScanResult | null;
  architectureMap: ArchitectureMapResult | null;
  gitMeta: GitMetadata | null;
  latestSummary: { content: string; generatedAt: string } | null;
  securityReport: SecurityReportResult | null;
  headroomReport: HeadroomReportResult | null;
  deployments: DeploymentRecord[];
}) {
  return (
    <IntelligenceDetailTabs tab={intelligenceTab} onTabChange={onIntelligenceTabChange}>
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
  );
}
