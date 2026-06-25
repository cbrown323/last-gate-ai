"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PIN_DRAG_MIME, setApplicationPinned } from "@/lib/applications/pin";
import type { LifecycleBoardData } from "@/lib/dashboard/lifecycle-board";
import type { Application } from "@/types";
import { DashboardPinnedApps } from "@/components/dashboard/dashboard-pinned-apps";
import { LifecycleMetricsBoard } from "@/components/dashboard/lifecycle-metrics-board";

export function DashboardBoard({
  boardData,
  pinnedApplications,
}: {
  boardData: LifecycleBoardData;
  pinnedApplications: Application[];
}) {
  const router = useRouter();
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [pinDropActive, setPinDropActive] = useState(false);
  const [pinning, setPinning] = useState(false);

  const pinnedIds = new Set(pinnedApplications.map((app) => app.id));

  async function handlePinDrop(applicationId: string) {
    if (pinning || pinnedIds.has(applicationId)) return;
    setPinning(true);
    try {
      await setApplicationPinned(applicationId, true);
      router.refresh();
    } finally {
      setPinning(false);
      setDraggingAppId(null);
      setPinDropActive(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Pinned
        </h2>
        <DashboardPinnedApps
          applications={pinnedApplications}
          isDropTarget={Boolean(draggingAppId)}
          isDropActive={pinDropActive}
          isPinning={pinning}
          onDragOver={(e) => {
            e.preventDefault();
            setPinDropActive(true);
          }}
          onDragLeave={() => setPinDropActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            const applicationId = e.dataTransfer.getData(PIN_DRAG_MIME);
            if (applicationId) void handlePinDrop(applicationId);
          }}
        />
      </div>

      <LifecycleMetricsBoard
        data={boardData}
        pinnedAppIds={pinnedIds}
        onAppDragStart={setDraggingAppId}
        onAppDragEnd={() => {
          setDraggingAppId(null);
          setPinDropActive(false);
        }}
      />
    </div>
  );
}
