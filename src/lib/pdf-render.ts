"use client";

export async function elementToPdfBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } catch {
    return null;
  }
}

export async function renderReactComponentToPdfBlob(
  renderFn: (container: HTMLElement) => { unmount: () => void },
): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  document.body.appendChild(container);

  const printArea = document.createElement("div");
  container.appendChild(printArea);

  const { unmount } = renderFn(printArea);
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const target = printArea.firstElementChild as HTMLElement | null;
    if (!target) return null;
    return await elementToPdfBlob(target);
  } finally {
    unmount();
    document.body.removeChild(container);
  }
}
