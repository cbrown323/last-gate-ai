"use client";

import { createContext, useContext } from "react";
import type {
  ApplicationTabValue,
  IntelligenceTabValue,
} from "@/components/applications/application-detail-tabs";

type ApplicationDetailContextValue = {
  tab: ApplicationTabValue;
  setTab: (tab: ApplicationTabValue) => void;
  intelligenceTab: IntelligenceTabValue;
  setIntelligenceTab: (tab: IntelligenceTabValue) => void;
  hidePanelActions: boolean;
};

const ApplicationDetailContext = createContext<ApplicationDetailContextValue | null>(null);

export function ApplicationDetailProvider({
  value,
  children,
}: {
  value: ApplicationDetailContextValue;
  children: React.ReactNode;
}) {
  return (
    <ApplicationDetailContext.Provider value={value}>
      {children}
    </ApplicationDetailContext.Provider>
  );
}

export function useApplicationDetail() {
  const ctx = useContext(ApplicationDetailContext);
  if (!ctx) {
    throw new Error("useApplicationDetail must be used within ApplicationDetailProvider");
  }
  return ctx;
}

export function useApplicationDetailOptional() {
  return useContext(ApplicationDetailContext);
}
