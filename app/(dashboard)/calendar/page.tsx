import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getCalendarItems } from "@/lib/calendar/queries";
import { prisma } from "@/lib/db";

export default async function CalendarPage() {
  const [items, applications] = await Promise.all([
    getCalendarItems(),
    prisma.application.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Events, task deadlines, and roadmap milestones across your portfolio"
      />
      <CalendarView initialItems={items} applications={applications} />
    </div>
  );
}
