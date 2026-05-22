import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export const useReceipt = (orderId: string | number) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `receipt-${orderId}`,
  });

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return false;
    const { generatePdf } = await import("../utils/generatePdf");
    return generatePdf(receiptRef.current, `receipt-${orderId}.pdf`);
  };

  return {
    receiptRef,
    handlePrint,
    handleDownloadPdf,
  };
};
