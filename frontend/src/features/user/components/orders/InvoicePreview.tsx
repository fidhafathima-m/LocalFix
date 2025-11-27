import { useRef, useState, useEffect } from "react";
import { CheckCircleOutlineOutlined, CloseOutlined } from "@mui/icons-material";
import { PDFGenerator } from "./PDFGenerator";
import { UserSparePartsService } from "../../../../services/user/sparePartsService";
import type { SparePartsRequest } from "../../../../interface/user/ISpareParts";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: {
    bookingId: string;
    service: string;
    technician: {
      displayName: string;
      _id: string;
    };
    date: string;
    time: string;
    amount: number;
    paymentId?: string;
    paymentMethod?: string;
    problemDescription?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
    user?: {
      fullName: string;
      phoneNumber: string;
      email: string;
    };
    orderId?: string; // Add orderId to fetch spare parts
  };
}

const InvoiceModal = ({ isOpen, onClose, invoiceData }: InvoiceModalProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [spareParts, setSpareParts] = useState<SparePartsRequest[]>([]);
  const [, setLoadingSpareParts] = useState(false);

  // Fetch spare parts data when modal opens
  useEffect(() => {
    const fetchSpareParts = async () => {
      if (!isOpen || !invoiceData.orderId) return;

      try {
        setLoadingSpareParts(true);
        const sparePartsData = await UserSparePartsService.getSparePartsByOrder(
          invoiceData.orderId
        );
        // Only include approved spare parts requests
        const approvedSpareParts = sparePartsData.filter(
          (request) => request.status === "approved"
        );
        setSpareParts(approvedSpareParts);
      } catch (error) {
        console.error("Error fetching spare parts:", error);
        setSpareParts([]);
      } finally {
        setLoadingSpareParts(false);
      }
    };

    fetchSpareParts();
  }, [isOpen, invoiceData.orderId]);

  if (!isOpen) return null;

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time for display
  const formatDisplayTime = (timeString: string) => {
    return timeString
      .split(" - ")
      .map((time) => time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2"))
      .join(" - ");
  };

  // Calculate price breakdown including spare parts
  const calculatePriceBreakdown = (totalAmount: number) => {
    const serviceAmount = Math.round(totalAmount * 0.8);
    const convenienceFee = Math.round(totalAmount * 0.05);
    const taxes = totalAmount - serviceAmount - convenienceFee;

    return {
      serviceAmount,
      convenienceFee,
      taxes,
      total: totalAmount,
    };
  };

  // Calculate spare parts total
  const calculateSparePartsTotal = () => {
    return spareParts.reduce(
      (total, request) => total + request.totalAmount,
      0
    );
  };

  // Calculate final totals including spare parts
  const sparePartsTotal = calculateSparePartsTotal();
  const servicePriceBreakdown = calculatePriceBreakdown(
    invoiceData.amount - sparePartsTotal
  );
  const finalTotal = invoiceData.amount;

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const downloadButton = document.querySelector(
        ".download-pdf-button"
      ) as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.textContent = "Generating PDF...";
      }

      await PDFGenerator.generatePDF({
        element: invoiceRef.current,
        fileName: `invoice-${
          invoiceData.bookingId
        }-${new Date().getTime()}.pdf`,
        onStart: () => {
          console.log("PDF generation started...");
        },
        onComplete: () => {
          if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.textContent = "Download PDF";
          }
        },
        onError: (error) => {
          console.error("PDF generation failed:", error);
          alert("Failed to generate PDF. Please try again.");
          if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.textContent = "Download PDF";
          }
        },
      });
    } catch (error) {
      console.error("Error in handleDownloadPDF:", error);
      alert("Failed to generate PDF. Please try again.");

      const downloadButton = document.querySelector(
        ".download-pdf-button"
      ) as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.textContent = "Download PDF";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="download-pdf-button px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseOutlined className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content for PDF Generation */}
        <div ref={invoiceRef} className="p-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-300">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                LocalFix
              </h1>
              <p className="text-sm text-gray-600">
                Connecting homeowners with verified local technicians
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold mb-2">Service Invoice</h3>
              <p className="text-sm text-gray-600">
                Invoice #: INV-{invoiceData.bookingId}
              </p>
              <p className="text-sm text-gray-600">Date: {currentDate}</p>
            </div>
          </div>

          {/* Customer and Technician Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">
                Customer Information
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium">
                  {invoiceData.user?.fullName || "Customer"}
                </p>
                <p>{invoiceData.user?.phoneNumber || "Phone not available"}</p>
                <p>{invoiceData.user?.email || "Email not available"}</p>
                {invoiceData.address && (
                  <p>
                    {invoiceData.address.street}, {invoiceData.address.city},{" "}
                    {invoiceData.address.state} - {invoiceData.address.pincode}
                    {invoiceData.address.landmark &&
                      ` (${invoiceData.address.landmark})`}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">
                Technician Information
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium">
                  {invoiceData.technician.displayName}
                </p>
                <p>ID: {invoiceData.technician._id}</p>
                <p>Service Expert</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-gray-900">
              Service Details
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Booking ID:</p>
                <p className="font-medium text-gray-800">
                  {invoiceData.bookingId}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Service:</p>
                <p className="font-medium text-gray-800">
                  {invoiceData.service}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Problem Description:</p>
                <p className="font-medium text-gray-800">
                  {invoiceData.problemDescription || "Standard service"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date & Time:</p>
                <p className="font-medium text-gray-800">
                  {formatDisplayDate(invoiceData.date)},{" "}
                  {formatDisplayTime(invoiceData.time)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status:</p>
                <p className="font-medium text-green-600">
                  {invoiceData.paymentMethod === "cod" ? "Confirmed" : "Paid"}
                </p>
              </div>
            </div>
          </div>

          {/* Service Price Breakdown */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-gray-900">
              Service Charges
            </h3>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">
                    {invoiceData.service} (Base Service)
                  </td>
                  <td className="text-center py-3 text-gray-700">1</td>
                  <td className="text-right py-3 text-gray-700">
                    {servicePriceBreakdown.serviceAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">Convenience Fee</td>
                  <td className="text-center py-3 text-gray-700">1</td>
                  <td className="text-right py-3 text-gray-700">
                    {servicePriceBreakdown.convenienceFee.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">Taxes (GST)</td>
                  <td className="text-center py-3 text-gray-700">-</td>
                  <td className="text-right py-3 text-gray-700">
                    {servicePriceBreakdown.taxes.toFixed(2)}
                  </td>
                </tr>
                <tr className="font-semibold border-t-2 border-gray-300">
                  <td className="py-3 text-gray-900">Service Total</td>
                  <td className="text-center py-3"></td>
                  <td className="text-right py-3 text-gray-900">
                    ₹{servicePriceBreakdown.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Spare Parts Section */}
          {spareParts.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-gray-900">
                Approved Spare Parts
              </h3>
              {spareParts.map((request, index) => (
                <div key={request._id} className="mb-6 last:mb-0">
                  {spareParts.length > 1 && (
                    <h4 className="font-medium text-gray-800 mb-3 text-sm">
                      Spare Parts Request #{index + 1}
                    </h4>
                  )}

                  {/* Technician Notes */}
                  {request.technicianNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-blue-800 text-sm">
                        <span className="font-medium">Technician Notes:</span>{" "}
                        {request.technicianNotes}
                      </p>
                    </div>
                  )}

                  {/* Spare Parts Items Table */}
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 text-sm font-semibold text-gray-900">
                          Item Name
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-900">
                          Unit Price
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-900">
                          Total (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {request.items.map((item, itemIndex) => (
                        <tr
                          key={itemIndex}
                          className="border-b border-gray-200"
                        >
                          <td className="py-3 text-gray-700">{item.name}</td>
                          <td className="text-center py-3 text-gray-700">
                            {item.price.toFixed(2)}
                          </td>
                          <td className="text-center py-3 text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="text-right py-3 text-gray-700">
                            {item.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold border-t-2 border-gray-300">
                        <td className="py-3 text-gray-900" colSpan={3}>
                          Spare Parts Subtotal
                        </td>
                        <td className="text-right py-3 text-gray-900">
                          ₹{request.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Spare Parts Grand Total */}
              {spareParts.length > 1 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-900">
                      Total Spare Parts Amount
                    </span>
                    <span className="text-gray-900">
                      ₹{sparePartsTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Total Section */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-gray-900">
              Final Amount Summary
            </h3>
            <table className="w-full border-collapse">
              <tbody className="text-sm">
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700 font-medium">
                    Service Total
                  </td>
                  <td className="text-right py-3 text-gray-700">
                    ₹{servicePriceBreakdown.total.toFixed(2)}
                  </td>
                </tr>
                {sparePartsTotal > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3 text-gray-700 font-medium">
                      Spare Parts Total
                    </td>
                    <td className="text-right py-3 text-gray-700">
                      + ₹{sparePartsTotal.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="font-bold border-t-2 border-gray-300 text-lg">
                  <td className="py-3 text-gray-900">Grand Total</td>
                  <td className="text-right py-3 text-gray-900">
                    ₹{finalTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-gray-900">
              Payment Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-6 text-sm border border-gray-200">
              <div>
                <p className="text-gray-600 mb-1">Payment Method:</p>
                <p className="font-medium text-gray-800 capitalize">
                  {invoiceData.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : invoiceData.paymentMethod === "online"
                    ? "Online Payment"
                    : "Payment"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Transaction ID:</p>
                <p className="font-medium text-gray-800">
                  {invoiceData.paymentId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Payment Status:</p>
                <p className="font-medium text-green-600 flex items-center">
                  <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
                  {invoiceData.paymentMethod === "cod"
                    ? "Confirmed"
                    : "Successful"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Amount Paid:</p>
                <p className="font-medium text-gray-800">
                  ₹{finalTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-gray-900">
              Terms & Conditions
            </h3>
            <div className="text-sm text-gray-600 space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p>
                <span className="font-medium text-gray-800">
                  Cancellation/Refund Policy:
                </span>{" "}
                Cancellations made more than 2 hours before the scheduled
                service time will receive a full refund. Late cancellations will
                incur a ₹100 fee.
              </p>
              <p>
                <span className="font-medium text-gray-800">Warranty:</span> 30
                days service warranty on labor. Parts warranty as per
                manufacturer terms.
              </p>
              {spareParts.length > 0 && (
                <p>
                  <span className="font-medium text-gray-800">
                    Spare Parts Warranty:
                  </span>
                  All spare parts come with manufacturer warranty. Please retain
                  this invoice for warranty claims.
                </p>
              )}
              <p className="text-xs mt-4 pt-3 border-t border-gray-300">
                This is a system-generated invoice by LocalFix. For queries,
                contact support@localfix.in
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-6 text-sm text-gray-600">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-2">LocalFix</p>
                <p>LocalFix Office, Town Center, Sector-4, Noida 670001</p>
                <p>GST: 29AALCS4613R1ZM</p>
              </div>
              <div className="text-right">
                <p>Support: +91 9876543210</p>
                <p>Email: support@localfix.in</p>
                <p>Website: www.localfix.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
