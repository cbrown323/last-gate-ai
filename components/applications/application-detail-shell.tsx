"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { ApplicationDetailProvider } from "@/components/applications/application-detail-context";
import { ApplicationAdvancedPanel } from "@/components/applications/application-advanced-panel";
import { ApplicationIntelligenceSection } from "@/components/applications/application-intelligence-section";
import { ProjectIntelligenceGuide } from "@/components/applications/project-intelligence-guide";
import { useIntelligenceAnalysis } from "@/components/applications/use-intelligence-analysis";
import { ApplicationFocusGuide } from "@/components/applications/application-focus-guide";
import {
  ApplicationDetailTabs,
  type ApplicationTabValue,
  type IntelligenceTabValue,
} from "@/components/applications/application-detail-tabs";
import {
  INTELLIGENCE_STEPS,
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
  initialTab,
  initialIntelligenceTab,
  initialFocus,
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
  initialTab?: ApplicationTabValue;
  initialIntelligenceTab?: IntelligenceTabValue;
  initialFocus?: string | null;
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
  const [tab, setTab] = useState<ApplicationTabValue>(initialTab ?? "overview");
  const [intelligenceTab, setIntelligenceTab] = useState<IntelligenceTabValue>(
    initialIntelligenceTab ?? "stack"
  );
  const [progress, setProgress] = useState<IntelligenceProgress>(initialProgress);

  const onProgressChange = useCallback((next: IntelligenceProgress) => {
    setProgress(next);
  }, []);

  const onStepTab = useCallback((stepTab: IntelligenceTabValue) => {
    setTab("intelligence");
    setIntelligenceTab(stepTab);
  }, []);

  const analysis = useIntelligenceAnalysis({
    applicationId,
    repoUrl,
    progress,
    onProgressChange,
    onStepTab,
  });

  const completedCount = analysis.completedCount;
  const analysisComplete = analysis.analysisComplete;

  useEffect(() => {
    if (!analysis.running) {
      setProgress(initialProgress);
    }
  }, [initialProgress, analysis.running]);

  return (
    <ApplicationDetailProvider
      value={{
        tab,
        setTab,
        intelligenceTab,
        setIntelligenceTab,
        hidePanelActions: false,
      }}
    >
      <div className="space-y-4">
        <Suspense fallback={null}>
          <ApplicationFocusGuide initialFocus={initialFocus} />
        </Suspense>
        <div className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 pb-1 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <ProjectIntelligenceGuide
            repoUrl={repoUrl}
            progress={progress}
            running={analysis.running}
            activeStepId={analysis.activeStepId}
            error={analysis.error}
            activeStepDescription={analysis.activeStepDescription}
            completedCount={analysis.completedCount}
            totalSteps={analysis.totalSteps}
            analysisComplete={analysis.analysisComplete}
            ctaLabel={analysis.ctaLabel}
            ctaHint={analysis.ctaHint}
            canRun={analysis.canRun}
            onRunAnalysis={() => analysis.runAnalysis(analysis.analysisComplete)}
            onStepTab={onStepTab}
          />
        </div>

        <ApplicationAdvancedPanel
          completedSteps={completedCount}
          totalSteps={INTELLIGENCE_STEPS.length}
          analysisComplete={analysisComplete}
        >
          {advancedContent}
        </ApplicationAdvancedPanel>

        <ApplicationDetailTabs
          tab={tab}
          onTabChange={setTab}
          intelligenceCompletedCount={completedCount}
          intelligenceTotalSteps={INTELLIGENCE_STEPS.length}
          analysisComplete={analysisComplete}
        >
          <TabsContent value="overview" className="mt-4 space-y-4">
            {overviewContent}
          </TabsContent>
          <TabsContent value="intelligence" className="mt-4">
            <ApplicationIntelligenceSection
              applicationId={applicationId}
              repoUrl={repoUrl}
              intelligenceTab={intelligenceTab}
              onIntelligenceTabChange={setIntelligenceTab}
              progress={progress}
              analysisComplete={analysisComplete}
              analysisCtaHint={analysis.ctaHint}
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
