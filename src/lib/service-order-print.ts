import type { Sale, ServiceOrder, Prescription } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { classifyPrescriptionGrade } from "@/lib/lens-grade";
import { SALE_STATUS_LABELS } from "@/lib/inventory";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printServiceOrder(
  sale: Sale,
  order?: ServiceOrder | null,
  prescription?: Prescription | null,
): void {
  const grade = prescription
    ? classifyPrescriptionGrade(prescription)
    : null;

  const itemsHtml = sale.items
    .map(
      (i) => `
    <tr>
      <td>${escapeHtml(i.description)}</td>
      <td class="center">${i.quantity}</td>
      <td class="right">${formatCurrency(i.unit_price)}</td>
      <td class="right">${formatCurrency(i.total)}</td>
    </tr>`,
    )
    .join("");

  const rxHtml = prescription
    ? `
    <div class="section">
      <h3>Receita oftálmica — ${formatDate(prescription.exam_date)}</h3>
      <table class="rx">
        <tr><th></th><th>Esf</th><th>Cil</th><th>Eixo</th><th>Add</th><th>Classificação</th></tr>
        <tr>
          <td><strong>OD</strong></td>
          <td>${prescription.od_esf ?? "—"}</td>
          <td>${prescription.od_cil ?? "—"}</td>
          <td>${prescription.od_eixo ?? "—"}°</td>
          <td>${prescription.od_add ?? "—"}</td>
          <td>${grade?.od.label ?? "—"}</td>
        </tr>
        <tr>
          <td><strong>OE</strong></td>
          <td>${prescription.oe_esf ?? "—"}</td>
          <td>${prescription.oe_cil ?? "—"}</td>
          <td>${prescription.oe_eixo ?? "—"}°</td>
          <td>${prescription.oe_add ?? "—"}</td>
          <td>${grade?.oe.label ?? "—"}</td>
        </tr>
      </table>
      ${prescription.dp ? `<p>DP: ${prescription.dp} mm</p>` : ""}
      ${grade ? `<p><strong>Grau geral:</strong> ${grade.overall.label} — ${grade.overall.description}</p>` : ""}
    </div>`
    : "";

  const labHtml = order
    ? `
    <div class="section">
      <h3>Laboratório</h3>
      <p><strong>Lab:</strong> ${escapeHtml(order.lab_name)}</p>
      ${order.surfacing_type ? `<p><strong>Surfassagem:</strong> ${escapeHtml(order.surfacing_type)}</p>` : ""}
      ${order.block_code ? `<p><strong>Bloco:</strong> ${escapeHtml(order.block_code)}</p>` : ""}
      ${order.external_lab_ref ? `<p><strong>Ref. externa:</strong> ${escapeHtml(order.external_lab_ref)}</p>` : ""}
      ${order.expected_date ? `<p><strong>Previsão:</strong> ${formatDate(order.expected_date)}</p>` : ""}
    </div>`
    : "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>OS — ${escapeHtml(sale.client_name)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20mm; font-size: 11pt; color: #111; }
  h1 { font-size: 16pt; margin: 0 0 4px; }
  h2 { font-size: 12pt; color: #555; margin: 0 0 16px; font-weight: normal; }
  h3 { font-size: 11pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 16px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; }
  .center { text-align: center; }
  .right { text-align: right; }
  .total { font-size: 14pt; font-weight: bold; text-align: right; margin-top: 12px; }
  .sign { margin-top: 40px; display: flex; justify-content: space-between; }
  .sign div { width: 40%; border-top: 1px solid #333; padding-top: 4px; text-align: center; font-size: 9pt; }
  @media print { body { margin: 10mm; } }
</style></head><body>
  <h1>ORDEM DE SERVIÇO</h1>
  <h2>${formatDate(sale.created_at)}</h2>
  <div class="meta">
    <p><strong>Cliente:</strong> ${escapeHtml(sale.client_name)}</p>
    <p><strong>OS/Venda:</strong> #${sale.id.slice(0, 8).toUpperCase()}</p>
    <p><strong>Status:</strong> ${SALE_STATUS_LABELS[sale.status]}</p>
    ${sale.salesperson_name ? `<p><strong>Vendedor:</strong> ${escapeHtml(sale.salesperson_name)}</p>` : ""}
    ${sale.delivery_date ? `<p><strong>Entrega prevista:</strong> ${formatDate(sale.delivery_date)}</p>` : ""}
  </div>
  ${rxHtml}
  <div class="section">
    <h3>Itens</h3>
    <table>
      <thead><tr><th>Descrição</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p class="total">Total: ${formatCurrency(sale.total)}</p>
  </div>
  ${labHtml}
  ${sale.notes ? `<p><strong>Obs.:</strong> ${escapeHtml(sale.notes)}</p>` : ""}
  <div class="sign">
    <div>Assinatura do cliente</div>
    <div>Responsável técnico</div>
  </div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

  const win = window.open("", "_blank", "width=800,height=700");
  if (!win) {
    alert("Permita pop-ups para imprimir a OS.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
