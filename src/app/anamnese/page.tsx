"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";
import AnamnesePageContent from "./content";

export default function AnamnesePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </AppShell>
      }
    >
      <AnamnesePageContent />
    </Suspense>
  );
}
