import { PageHeader } from "@/components/layout/page-header";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationFormDialog } from "@/components/applications/application-form";
import { GitHubImportDialog } from "@/components/applications/github-import-dialog";
import { getApplications } from "@/lib/portfolio";
import { serializeApplication } from "@/lib/serialize";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Your software portfolio registry"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <GitHubImportDialog />
            <ApplicationFormDialog />
          </div>
        }
      />
      {applications.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">No applications registered yet.</p>
          <ApplicationFormDialog />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={serializeApplication(app)} />
          ))}
        </div>
      )}
    </div>
  );
}
