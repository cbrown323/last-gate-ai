export function isTaskOverdue(dueAt: Date | string | null): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now();
}
