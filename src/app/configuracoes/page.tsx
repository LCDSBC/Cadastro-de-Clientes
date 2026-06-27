"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { StoreSettingsPanel } from "@/components/configuracoes/store-settings-panel";
import { PreferencesPanel } from "@/components/configuracoes/preferences-panel";
import { SupabaseSetupPanel } from "@/components/configuracoes/supabase-setup-panel";
import { SystemInfoPanel } from "@/components/configuracoes/system-info-panel";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { UsersPanel, MultiStorePanel } from "@/components/configuracoes/users-multi-store-panels";
import { ProfessionalsPanel } from "@/components/configuracoes/professionals-panel";
import {
  Building2,
  Sliders,
  Database,
  Info,
  Users,
  Store,
  Stethoscope,
} from "lucide-react";

const tabs = [
  { id: "loja", label: "Loja", icon: Building2 },
  { id: "preferencias", label: "Preferências", icon: Sliders },
  { id: "profissionais", label: "Profissionais", icon: Stethoscope },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "filiais", label: "Multi-loja", icon: Store },
  { id: "integracoes", label: "Integrações", icon: Database },
  { id: "sistema", label: "Sistema", icon: Info },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("loja");

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  return (
    <AppShell>
      <PageHeader
        title="Configurações"
        description={`Dados da loja, preferências e integrações — ${storageLabel}`}
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary-600 text-primary-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "loja" && <StoreSettingsPanel />}
        {activeTab === "preferencias" && <PreferencesPanel />}
        {activeTab === "profissionais" && <ProfessionalsPanel />}
        {activeTab === "usuarios" && <UsersPanel />}
        {activeTab === "filiais" && <MultiStorePanel />}
        {activeTab === "integracoes" && <SupabaseSetupPanel />}
        {activeTab === "sistema" && <SystemInfoPanel />}
      </div>
    </AppShell>
  );
}
