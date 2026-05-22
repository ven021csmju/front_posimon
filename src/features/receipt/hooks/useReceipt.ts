import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { generatePdf } from "../utils/generatePdf";

export const useReceipt = (orderId: string | number) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `receipt-${orderId}`,
  });

  const handleDownloadPdf = async () => {
    if (receiptRef.current) {
      return await generatePdf(receiptRef.current, `receipt-${orderId}.pdf`);
    }
    return false;
  };

  return {
    receiptRef,
    handlePrint,
    handleDownloadPdf,
  };
};
