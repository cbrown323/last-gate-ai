import { Suspense } from "react";
import { ApplicationFocusGuide } from "@/components/applications/application-focus-guide";

export function TasksFocusGuide({ focus }: { focus?: string | null }) {
  return (
    <Suspense fallback={null}>
      <ApplicationFocusGuide initialFocus={focus} />
    </Suspense>
  );
}
