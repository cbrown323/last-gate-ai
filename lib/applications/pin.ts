export async function setApplicationPinned(applicationId: string, isPinned: boolean) {
  const res = await fetch(`/api/applications/${applicationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPinned }),
  });
  if (!res.ok) throw new Error("Failed to update pin");
}

export const PIN_DRAG_MIME = "application/vnd.last-gate-ai.application-id";
