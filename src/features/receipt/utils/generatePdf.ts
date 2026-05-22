import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePdf(element: HTMLElement, fileName: string = "receipt.pdf") {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());
      },
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Calculate PDF dimensions based on canvas aspect ratio
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
