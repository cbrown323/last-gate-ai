import type { LifecyclePhase } from "@/types";

/**
 * Recommended max days per lifecycle phase before review/advance.
 *
 * References (prior research for Last Gate PM buildout):
 * - Playbook: monthly phase review; stale backlog triage at 30 days
 * - Lead/cycle time analytics: phases should not drift indefinitely
 * - Lean startup: time-box discovery; epic date ranges on the roadmap
 */
export const LIFECYCLE_PHASE_MAX_DAYS: Record<LifecyclePhase, number> = {
  discovery: 21,
  planning: 14,
  development: 84,
  launch: 14,
  growth: 90,
  maintenance: 180,
  sunset: 30,
};

export const LIFECYCLE_PHASE_REVIEW_DAYS: Record<LifecyclePhase, number> = {
  discovery: 7,
  planning: 7,
  development: 28,
  launch: 7,
  growth: 30,
  maintenance: 60,
  sunset: 14,
};

export type LifecyclePhaseTiming = {
  phase: LifecyclePhase;
  daysInPhase: number;
  maxDays: number;
  reviewAtDays: number;
  percentElapsed: number;
  isOverdue: boolean;
  needsReview: boolean;
  message: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysInPhase(phaseStartedAt: Date | string): number {
  const started = new Date(phaseStartedAt).getTime();
  return Math.max(0, Math.floor((Date.now() - started) / MS_PER_DAY));
}

export function getLifecyclePhaseTiming(
  phase: LifecyclePhase,
  phaseStartedAt: Date | string
): LifecyclePhaseTiming {
  const daysInPhase = getDaysInPhase(phaseStartedAt);
  const maxDays = LIFECYCLE_PHASE_MAX_DAYS[phase];
  const reviewAtDays = LIFECYCLE_PHASE_REVIEW_DAYS[phase];
  const percentElapsed = Math.min(100, Math.round((daysInPhase / maxDays) * 100));
  const isOverdue = daysInPhase > maxDays;
  const needsReview = daysInPhase >= reviewAtDays && !isOverdue;

  let message: string;
  if (isOverdue) {
    message = `This phase has exceeded the ${maxDays}-day guideline. Advance the lifecycle or document why you're staying. Long phases often signal scope drift.`;
  } else if (needsReview) {
    const remaining = maxDays - daysInPhase;
    message = `Day ${daysInPhase} of ~${maxDays} recommended for ${phase}. Review progress in the next ${remaining} day${remaining === 1 ? "" : "s"} or advance when exit criteria are met.`;
  } else {
    message = `Day ${daysInPhase} of ~${maxDays} recommended. Velocity and effort signals on the dashboard help decide when to advance.`;
  }

  return {
    phase,
    daysInPhase,
    maxDays,
    reviewAtDays,
    percentElapsed,
    isOverdue,
    needsReview,
    message,
  };
}

export const VELOCITY_EFFORT_MEASUREMENT_NOTE =
  "Velocity combines repo commits (last 7/30 days) and tasks completed on the board. Effort combines logged task hours, estimates, and board edits. Sync GitHub and move tasks to Done for accurate signals.";
