"use client";

import type { ReactNode } from "react";
import {
  SettingsCategoryBadge,
  settingsCategoryCardClass,
  type SettingsCategory,
} from "@/components/settings/settings-category";
import { SettingsExpandableDetails } from "@/components/settings/settings-expandable-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SettingsDocumentationCard({
  title,
  expandLabel = "View details",
  children,
}: {
  title: string;
  expandLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn(settingsCategoryCardClass("documentation"))}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <SettingsCategoryBadge category="documentation" />
        </div>
      </CardHeader>
      <CardContent>
        <SettingsExpandableDetails label={expandLabel}>
          <div className="text-muted-foreground space-y-2 text-sm">{children}</div>
        </SettingsExpandableDetails>
      </CardContent>
    </Card>
  );
}

export { type SettingsCategory };
