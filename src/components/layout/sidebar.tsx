"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ModuleIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { systemModules } from "@/lib/modules";
import { cn } from "@/lib/utils";

const statusBadge = {
  active: null,
  beta: <Badge variant="info">Beta</Badge>,
  coming_soon: <Badge variant="warning">Em breve</Badge>,
};

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, authEnabled } = useAuth();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {systemModules.map((mod) => {
        const isActive = pathname === mod.href || pathname.startsWith(`${mod.href}/`);
        const disabled = mod.status === "coming_soon";

        return (
          <Link
            key={mod.id}
            href={disabled ? "#" : mod.href}
            onClick={(e) => {
              if (disabled) e.preventDefault();
              setMobileOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-50 text-primary-700"
                : disabled
                  ? "cursor-not-allowed text-slate-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <ModuleIcon name={mod.icon} className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate">{mod.name}</span>
            {statusBadge[mod.status]}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">OptiCare</h1>
            <p className="text-xs text-slate-500">ERP para Óticas</p>
          </div>
        </div>
        {nav}
        <div className="mt-auto border-t border-slate-100 p-4">
          {authEnabled && user ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <User className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="flex-1 truncate text-xs text-slate-600">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="h-7 w-7 p-0"
                title="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : authEnabled ? (
            <Link href="/login" className="mb-3 block text-xs font-medium text-primary-600 hover:underline">
              Fazer login
            </Link>
          ) : null}
          <p className="text-xs text-slate-400">v0.2.0 — Beta</p>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
