"use client";

import { useCallback, useEffect, useState } from "react";
import { ApplicationDetailProvider } from "@/components/applications/application-detail-context";
import { ApplicationAdvancedPanel } from "@/components/applications/application-advanced-panel";
import { ApplicationIntelligenceSection } from "@/components/applications/application-intelligence-section";
import { ProjectIntelligenceGuide } from "@/components/applications/project-intelligence-guide";
import {
  ApplicationDetailTabs,
  type ApplicationTabValue,
  type IntelligenceTabValue,
} from "@/components/applications/application-detail-tabs";
import {
  countCompletedSteps,
  INTELLIGENCE_STEPS,
  isAnalysisComplete,
  type IntelligenceProgress,
} from "@/lib/applications/intelligence-workflow";
import { TabsContent } from "@/components/ui/tabs";
import type {
  ArchitectureMapResult,
  DeploymentRecord,
  GitMetadata,
  HeadroomReportResult,
  SecurityReportResult,
  StackScanResult,
} from "@/types";

export function ApplicationDetailShell({
  applicationId,
  repoUrl,
  initialProgress,
  advancedContent,
  overviewContent,
  notesContent,
  calendarContent,
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
  initialProgress: IntelligenceProgress;
  advancedContent: React.ReactNode;
  overviewContent: React.ReactNode;
  notesContent: React.ReactNode;
  calendarContent: React.ReactNode;
  stackScan: StackScanResult | null;
  architectureMap: ArchitectureMapResult | null;
  gitMeta: GitMetadata | null;
  latestSummary: { content: string; generatedAt: string } | null;
  securityReport: SecurityReportResult | null;
  headroomReport: HeadroomReportResult | null;
  deployments: DeploymentRecord[];
}) {
  const [tab, setTab] = useState<ApplicationTabValue>("overview");
  const [intelligenceTab, setIntelligenceTab] = useState<IntelligenceTabValue>("stack");
  const [progress, setProgress] = useState<IntelligenceProgress>(initialProgress);
  const [running, setRunning] = useState(false);

  const completedCount = countCompletedSteps(progress, repoUrl);
  const analysisComplete = isAnalysisComplete(progress, repoUrl);

  useEffect(() => {
    if (!running) {
      setProgress(initialProgress);
    }
  }, [initialProgress, running]);

  const onProgressChange = useCallback((next: IntelligenceProgress) => {
    setProgress(next);
  }, []);

  const onStepTab = useCallback((stepTab: IntelligenceTabValue) => {
    setTab("intelligence");
    setIntelligenceTab(stepTab);
  }, []);

  return (
    <ApplicationDetailProvider
      value={{
        tab,
        setTab,
        intelligenceTab,
        setIntelligenceTab,
        hidePanelActions: true,
      }}
    >
      <div className="space-y-4">
        <ApplicationAdvancedPanel
          completedSteps={completedCount}
          totalSteps={INTELLIGENCE_STEPS.length}
          analysisComplete={analysisComplete}
        >
          <ProjectIntelligenceGuide
            applicationId={applicationId}
            repoUrl={repoUrl}
            progress={progress}
            running={running}
            onRunningChange={setRunning}
            onProgressChange={onProgressChange}
            onStepTab={onStepTab}
          />
          {advancedContent}
        </ApplicationAdvancedPanel>

        <ApplicationDetailTabs tab={tab} onTabChange={setTab}>
          <TabsContent value="overview" className="mt-4 space-y-4">
            {overviewContent}
          </TabsContent>
          <TabsContent value="intelligence" className="mt-4">
            <ApplicationIntelligenceSection
              applicationId={applicationId}
              repoUrl={repoUrl}
              intelligenceTab={intelligenceTab}
              onIntelligenceTabChange={setIntelligenceTab}
              stackScan={stackScan}
              architectureMap={architectureMap}
              gitMeta={gitMeta}
              latestSummary={latestSummary}
              securityReport={securityReport}
              headroomReport={headroomReport}
              deployments={deployments}
            />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            {notesContent}
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            {calendarContent}
          </TabsContent>
        </ApplicationDetailTabs>
      </div>
    </ApplicationDetailProvider>
  );
}
