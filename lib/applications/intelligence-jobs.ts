import { prisma } from "@/lib/db";
import type {
  IntelligenceJobRecord,
  IntelligenceJobStatus,
  IntelligenceJobTrigger,
  IntelligenceStepId,
  IntelligenceStepResult,
} from "@/types";

function parseStepResults(raw: unknown): IntelligenceStepResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is IntelligenceStepResult =>
      typeof item === "object" &&
      item !== null &&
      "stepId" in item &&
      "status" in item &&
      "durationMs" in item
  );
}

export function serializeIntelligenceJob(job: {
  id: string;
  applicationId: string;
  status: string;
  currentStep: string | null;
  stepResults: unknown;
  error: string | null;
  trigger: string;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}): IntelligenceJobRecord {
  return {
    id: job.id,
    applicationId: job.applicationId,
    status: job.status as IntelligenceJobStatus,
    currentStep: (job.currentStep as IntelligenceStepId | null) ?? null,
    stepResults: parseStepResults(job.stepResults),
    error: job.error,
    trigger: job.trigger as IntelligenceJobTrigger,
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
  };
}

export async function createIntelligenceJob(input: {
  applicationId: string;
  trigger: IntelligenceJobTrigger;
}) {
  const job = await prisma.intelligenceJob.create({
    data: {
      applicationId: input.applicationId,
      trigger: input.trigger,
      status: "pending",
    },
  });
  return serializeIntelligenceJob(job);
}

export async function getIntelligenceJob(id: string) {
  const job = await prisma.intelligenceJob.findUnique({ where: { id } });
  if (!job) return null;
  return serializeIntelligenceJob(job);
}

export async function listIntelligenceJobs(applicationId: string, limit = 10) {
  const jobs = await prisma.intelligenceJob.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return jobs.map(serializeIntelligenceJob);
}

export async function updateIntelligenceJob(
  id: string,
  data: {
    status?: IntelligenceJobStatus;
    currentStep?: IntelligenceStepId | null;
    stepResults?: IntelligenceStepResult[];
    error?: string | null;
    startedAt?: Date;
    completedAt?: Date;
  }
) {
  const job = await prisma.intelligenceJob.update({
    where: { id },
    data: {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.currentStep !== undefined ? { currentStep: data.currentStep } : {}),
      ...(data.stepResults !== undefined
        ? { stepResults: JSON.parse(JSON.stringify(data.stepResults)) }
        : {}),
      ...(data.error !== undefined ? { error: data.error } : {}),
      ...(data.startedAt !== undefined ? { startedAt: data.startedAt } : {}),
      ...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
    },
  });
  return serializeIntelligenceJob(job);
}
