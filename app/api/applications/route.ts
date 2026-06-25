import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  APPLICATION_STATUSES,
  LIFECYCLE_PHASE_LABELS,
  WORKFLOW_TYPE_LABELS,
} from "@/types";

const lifecyclePhases = Object.keys(LIFECYCLE_PHASE_LABELS) as [string, ...string[]];
const workflowTypes = Object.keys(WORKFLOW_TYPE_LABELS) as [string, ...string[]];

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(APPLICATION_STATUSES as [string, ...string[]]).optional(),
  repoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  owner: z.string().optional(),
  lifecyclePhase: z.enum(lifecyclePhases).optional(),
  workflowType: z.enum(workflowTypes).optional(),
  ticketPrefix: z.string().optional(),
  doingWipLimit: z.number().int().min(1).max(20).optional(),
  isPinned: z.boolean().optional(),
});

export async function GET() {
  const applications = await prisma.application.findMany({
    include: {
      gitMeta: true,
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status ?? "development",
      repoUrl: parsed.data.repoUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      owner: parsed.data.owner || null,
      lifecyclePhase: parsed.data.lifecyclePhase ?? "development",
      workflowType: parsed.data.workflowType ?? "kanban",
      ticketPrefix: parsed.data.ticketPrefix || null,
      doingWipLimit: parsed.data.doingWipLimit ?? 3,
      isPinned: parsed.data.isPinned ?? false,
    },
    include: { gitMeta: true },
  });

  return NextResponse.json(application, { status: 201 });
}
