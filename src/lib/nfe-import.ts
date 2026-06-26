export interface NfeImportedItem {
  description: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unit_cost: number;
  total: number;
  ncm?: string;
}

export interface NfeImportResult {
  supplier_name: string;
  supplier_cnpj?: string;
  invoice_number?: string;
  issue_date?: string;
  items: NfeImportedItem[];
  total: number;
}

function textContent(el: Element | null, tag: string): string {
  return el?.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
}

export function parseNfeXml(xmlText: string): NfeImportResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("XML inválido ou corrompido");
  }

  const infNFe =
    doc.getElementsByTagName("infNFe")[0] ??
    doc.getElementsByTagName("NFe")[0];
  if (!infNFe) {
    throw new Error("Arquivo não parece ser uma NF-e válida");
  }

  const emit = infNFe.getElementsByTagName("emit")[0];
  const supplier_name =
    textContent(emit, "xNome") || textContent(emit, "xFant") || "Fornecedor";
  const supplier_cnpj = textContent(emit, "CNPJ") || undefined;

  const ide = infNFe.getElementsByTagName("ide")[0];
  const invoice_number = textContent(ide, "nNF");
  const issue_date = textContent(ide, "dhEmi").slice(0, 10);

  const detNodes = infNFe.getElementsByTagName("det");
  const items: NfeImportedItem[] = [];

  for (let i = 0; i < detNodes.length; i++) {
    const det = detNodes[i];
    const prod = det.getElementsByTagName("prod")[0];
    if (!prod) continue;

    const quantity = parseFloat(textContent(prod, "qCom") || "1");
    const unit_cost = parseFloat(textContent(prod, "vUnCom") || "0");
    const total = parseFloat(textContent(prod, "vProd") || "0");

    items.push({
      description: textContent(prod, "xProd"),
      sku: textContent(prod, "cProd") || undefined,
      barcode: textContent(prod, "cEAN") || undefined,
      quantity,
      unit_cost,
      total: total || quantity * unit_cost,
      ncm: textContent(prod, "NCM") || undefined,
    });
  }

  if (items.length === 0) {
    throw new Error("Nenhum item encontrado na NF-e");
  }

  const total = items.reduce((sum, i) => sum + i.total, 0);

  return {
    supplier_name,
    supplier_cnpj,
    invoice_number: invoice_number || undefined,
    issue_date: issue_date || undefined,
    items,
    total,
  };
}
