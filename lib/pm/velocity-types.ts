import type { LifecyclePhase } from "@/types";

export type VelocityTrend = "rising" | "steady" | "falling" | "inactive";

export type ApplicationVelocityEffort = {
  applicationId: string;
  applicationName: string;
  lifecyclePhase: LifecyclePhase;
  velocityScore: number;
  effortScore: number;
  commitsLast7Days: number;
  commitsLast30Days: number;
  tasksCompletedLast7Days: number;
  tasksCompletedLast30Days: number;
  boardEditsLast7Days: number;
  boardEditsLast30Days: number;
  estimatedHours: number;
  spentHours: number;
  velocityTrend: VelocityTrend;
};

export type LifecycleVelocityAlert = {
  applicationId: string;
  applicationName: string;
  lifecyclePhase: LifecyclePhase;
  daysInPhase: number;
  maxDays: number;
  isOverdue: boolean;
  needsReview: boolean;
  message: string;
};

export type VelocityEffortStats = {
  portfolioVelocity: number;
  portfolioEffortScore: number;
  commitsLast7Days: number;
  commitsLast30Days: number;
  tasksCompletedLast7Days: number;
  tasksCompletedLast30Days: number;
  boardEditsLast7Days: number;
  estimatedHours: number;
  spentHours: number;
  byApplication: ApplicationVelocityEffort[];
  lifecycleAlerts: LifecycleVelocityAlert[];
  measurementNote: string;
};

export function formatVelocityTrend(trend: VelocityTrend): string {
  switch (trend) {
    case "rising":
      return "Rising";
    case "falling":
      return "Falling";
    case "steady":
      return "Steady";
    default:
      return "Inactive";
  }
}
