"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MetricWorkflow } from "@/lib/dashboard/metric-workflows";

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function MetricWorkflowDialog({
  workflow,
  open,
  onOpenChange,
}: {
  workflow: MetricWorkflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!workflow) return null;

  const primaryExternal = isExternalHref(workflow.primaryAction.href);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="size-4 text-emerald-600" />
            {workflow.title}
          </DialogTitle>
          <DialogDescription>{workflow.summary}</DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 text-sm">
          {workflow.steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{step.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <DialogFooter className="gap-2 sm:gap-0">
          {workflow.secondaryAction ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={
                isExternalHref(workflow.secondaryAction.href) ? (
                  <a
                    href={workflow.secondaryAction.href}
                    target="_blank"
                    rel="noreferrer"
                  />
                ) : (
                  <Link href={workflow.secondaryAction.href} />
                )
              }
            >
              {workflow.secondaryAction.label}
            </Button>
          ) : null}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            nativeButton={false}
            render={
              primaryExternal ? (
                <a href={workflow.primaryAction.href} target="_blank" rel="noreferrer" />
              ) : (
                <Link href={workflow.primaryAction.href} />
              )
            }
          >
            {workflow.primaryAction.label}
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
