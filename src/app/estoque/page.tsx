import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { demoProducts } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function EstoquePage() {
  return (
    <AppShell>
      <PageHeader
        title="Estoque"
        description="Controle de armações, lentes oftálmicas, lentes de contato e inventário"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Produtos em estoque (demonstração)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4">SKU</th>
                  <th className="pb-2 pr-4">Produto</th>
                  <th className="pb-2 pr-4">Categoria</th>
                  <th className="pb-2 pr-4">Estoque</th>
                  <th className="pb-2 pr-4">Preço</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-mono text-xs">{product.sku}</td>
                    <td className="py-3 pr-4 font-medium">{product.name}</td>
                    <td className="py-3 pr-4 capitalize">{product.category.replace("_", " ")}</td>
                    <td className="py-3 pr-4">{product.stock_quantity}</td>
                    <td className="py-3 pr-4">{formatCurrency(product.sale_price)}</td>
                    <td className="py-3">
                      {product.stock_quantity <= product.min_stock ? (
                        <Badge variant="danger">Estoque baixo</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ModulePlaceholder
        features={[
          "Cadastro de armações, solares e lentes",
          "Estoque em grade (esf/cil/eixo)",
          "Pedido de compras e transferência entre lojas",
          "Inventário com coletor de dados",
          "Etiquetas Argox/Zebra",
          "Importação de XML de fornecedores",
        ]}
      />
    </AppShell>
  );
}
