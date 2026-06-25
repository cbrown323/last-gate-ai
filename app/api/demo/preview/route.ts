import { NextResponse } from "next/server";
import {
  getDemoPreviewStatus,
  loadDemoPreview,
} from "@/lib/demo/load-preview";

export async function GET() {
  const status = await getDemoPreviewStatus();
  return NextResponse.json(status);
}

export async function POST() {
  try {
    const result = await loadDemoPreview();
    return NextResponse.json({
      ok: true,
      ...result,
      message: "Demo preview data loaded. Open the application to explore all tabs.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load demo preview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
