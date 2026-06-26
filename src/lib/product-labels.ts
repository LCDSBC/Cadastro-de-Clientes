import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { formatContactLensSpec } from "@/lib/inventory-savwin";

export type LabelFormat = "argox_50x30" | "zebra_40x25" | "a4_grid";

function labelSize(format: LabelFormat): { width: string; height: string } {
  switch (format) {
    case "zebra_40x25":
      return { width: "40mm", height: "25mm" };
    case "a4_grid":
      return { width: "63mm", height: "38mm" };
    default:
      return { width: "50mm", height: "30mm" };
  }
}

function renderLabel(product: Product): string {
  const lc =
    product.category === "lente_contato"
      ? `<div class="lc">${formatContactLensSpec(product.contact_lens)}</div>`
      : "";

  return `
    <div class="label">
      <div class="name">${escapeHtml(product.name)}</div>
      <div class="sku">${escapeHtml(product.sku)}</div>
      ${product.barcode ? `<div class="barcode">*${escapeHtml(product.barcode)}*</div>` : ""}
      <div class="price">${formatCurrency(product.sale_price)}</div>
      ${lc}
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printProductLabels(
  products: Product[],
  format: LabelFormat = "argox_50x30",
  copiesPerProduct = 1,
): void {
  const copies = Math.max(1, Math.min(99, copiesPerProduct));
  const expanded = products.flatMap((p) => Array.from({ length: copies }, () => p));
  const { width, height } = labelSize(format);
  const isGrid = format === "a4_grid";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Etiquetas — OptiCare</title>
<style>
  @page { margin: ${isGrid ? "10mm" : "0"}; }
  body { font-family: Arial, sans-serif; margin: 0; padding: ${isGrid ? "5mm" : "0"}; }
  .sheet { display: ${isGrid ? "flex" : "block"}; flex-wrap: wrap; gap: 2mm; }
  .label {
    width: ${width}; height: ${height};
    border: 1px dashed #ccc;
    padding: 2mm;
    box-sizing: border-box;
    overflow: hidden;
    page-break-inside: avoid;
    ${isGrid ? "" : "margin: 2mm;"}
  }
  .name { font-size: ${isGrid ? "9pt" : "8pt"}; font-weight: bold; line-height: 1.2; }
  .sku { font-size: 7pt; color: #555; margin-top: 1mm; }
  .barcode { font-family: monospace; font-size: 10pt; margin-top: 1mm; letter-spacing: 1px; }
  .price { font-size: ${isGrid ? "11pt" : "10pt"}; font-weight: bold; margin-top: 1mm; }
  .lc { font-size: 6pt; color: #666; margin-top: 1mm; }
  @media print { .label { border-color: #eee; } }
</style></head><body>
<div class="sheet">
${expanded.map(renderLabel).join("")}
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) {
    alert("Permita pop-ups para imprimir etiquetas.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
