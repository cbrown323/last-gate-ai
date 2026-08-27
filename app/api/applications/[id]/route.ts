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
});

const updateSchema = createSchema.extend({
  isPinned: z.boolean().optional(),
  doingWipLimit: z.number().int().min(1).max(20).optional(),
}).partial();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      gitMeta: true,
      tasks: { orderBy: [{ status: "asc" }, { position: "asc" }] },
      summaries: { orderBy: { generatedAt: "desc" }, take: 5 },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const application = await prisma.application.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.repoUrl !== undefined && { repoUrl: data.repoUrl || null }),
      ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl || null }),
      ...(data.owner !== undefined && { owner: data.owner || null }),
      // Keep lifecyclePhaseStartedAt when the phase changes so elapsed
      // timing is preserved across manual switches / advances.
      ...(data.lifecyclePhase !== undefined && {
        lifecyclePhase: data.lifecyclePhase,
      }),
      ...(data.workflowType !== undefined && { workflowType: data.workflowType }),
      ...(data.ticketPrefix !== undefined && { ticketPrefix: data.ticketPrefix || null }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.doingWipLimit !== undefined && { doingWipLimit: data.doingWipLimit }),
    },
    include: { gitMeta: true },
  });

  return NextResponse.json(application);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
