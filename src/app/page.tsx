import Link from "next/link";
import { ArrowRight, Eye, Package, ShoppingCart, Wallet, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEST_ACCESS_PATH } from "@/lib/test-access";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur">
            <Eye className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white">OptiCare ERP</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={TEST_ACCESS_PATH}>
            <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link2 className="h-4 w-4" />
              Link de teste
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              Acessar Sistema
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent-400">
            Gestão completa para óticas
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            ERP ótico com acuidade visual digital integrada
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300">
            Unifique a gestão da sua ótica — estoque, vendas, financeiro, laboratório
            e clínica — com o <strong>Acuidade Visual Pró</strong> da JL Soluções Digitais:
            testes de visão digitais e prontuários optométricos integrados.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={TEST_ACCESS_PATH}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Link2 className="h-4 w-4" />
                Link de teste
              </Button>
            </Link>
            <Link href="/acuidade-visual">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Testar Acuidade Visual
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Eye,
              title: "Acuidade Visual Pró",
              desc: "Testes de visão + laudos, receitas e fichas clínicas",
            },
            {
              icon: ShoppingCart,
              title: "Vendas & OS",
              desc: "Orçamentos, vendas, trocas e ordens de serviço",
            },
            {
              icon: Package,
              title: "Estoque em Grade",
              desc: "Armações, lentes oftálmicas e lentes de contato",
            },
            {
              icon: Wallet,
              title: "Financeiro",
              desc: "Contas, fluxo de caixa, DRE e conciliação",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <feature.icon className="mb-4 h-8 w-8 text-accent-400" />
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
