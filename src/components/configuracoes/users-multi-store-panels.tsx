"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  loadAppUsers,
  saveAppUser,
  deleteAppUser,
  ROLE_LABELS,
  ALL_PERMISSIONS,
  type AppUser,
  type UserRole,
} from "@/lib/users-store";
import { STORE_BRANCHES } from "@/lib/inventory-savwin";
import {
  getActiveStoreId,
  setActiveStoreId,
  getActiveStoreName,
} from "@/lib/users-store";
import { Plus, Trash2 } from "lucide-react";

export function UsersPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", role: "vendedor" as UserRole, password_hint: "" });

  async function refresh() {
    setUsers(await loadAppUsers());
  }

  useEffect(() => { void refresh(); }, []);

  async function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) return;
    await saveAppUser({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      store_id: getActiveStoreId(),
      active: true,
      password_hint: form.password_hint || undefined,
    });
    setForm({ name: "", email: "", role: "vendedor", password_hint: "" });
    await refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários e permissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Gestão local de usuários (MVP). Permissões por perfil: {ALL_PERMISSIONS.join(", ")}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="flex-1" />
          <Input placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="flex-1" />
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            className="w-40"
          />
          <Input placeholder="Senha (dica)" value={form.password_hint} onChange={(e) => setForm({ ...form, password_hint: e.target.value })} className="w-32" />
          <Button onClick={() => void handleAdd()}><Plus className="h-4 w-4" />Adicionar</Button>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
                <Badge variant="info" className="mt-1">{ROLE_LABELS[u.role]}</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => void deleteAppUser(u.id).then(refresh)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MultiStorePanel() {
  const [activeId, setActiveId] = useState(getActiveStoreId());

  function selectStore(id: string) {
    setActiveStoreId(id);
    setActiveId(id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Loja ativa: <strong>{getActiveStoreName()}</strong>. Dados são filtrados por filial no modo nuvem.
        </p>
        <div className="space-y-2">
          {STORE_BRANCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectStore(s.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                activeId === s.id ? "border-primary-500 bg-primary-50" : "hover:bg-slate-50"
              }`}
            >
              <p className="font-medium">{s.name}</p>
              <p className="font-mono text-xs text-slate-500">{s.id.slice(0, 8)}…</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
