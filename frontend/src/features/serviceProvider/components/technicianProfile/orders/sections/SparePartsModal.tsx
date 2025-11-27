import { useState, useEffect } from "react";
import {
  AddOutlined,
  CloseOutlined,
  RemoveOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { ItemManagementService } from "../../../../../../services/admin/ItemManagementService";
import { useSocket } from "../../../../../../context/SocketContext";

export interface SparePart {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
  description?: string;
  sku?: string;
}

interface SparePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (parts: SparePart[]) => void;
  serviceId?: string;
  serviceName: string;
}

export function SparePartsModal({
  isOpen,
  onClose,
  onSubmit,
  serviceId,
  serviceName,
}: SparePartsModalProps) {
  const { socket } = useSocket();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real items from your admin service
  useEffect(() => {
    const fetchItems = async () => {
      if (!isOpen || !serviceId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch items specific to the service
        const response = await ItemManagementService.getItemsByService(
          serviceId,
          1,
          100
        );

        // Transform the API response to SparePart format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: SparePart[] = response.items.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          selected: false,
          description: item.description,
          sku: item.sku,
        }));

        setParts(items);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load spare parts. Please try again.");
        setParts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isOpen, serviceId, serviceName]);

  const togglePart = (id: string) => {
    setParts(
      parts.map((part) =>
        part.id === id
          ? {
              ...part,
              selected: !part.selected,
            }
          : part
      )
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setParts(
      parts.map((part) =>
        part.id === id
          ? {
              ...part,
              quantity: Math.max(1, part.quantity + delta),
            }
          : part
      )
    );
  };

  const totalAmount = parts
    .filter((part) => part.selected)
    .reduce((sum, part) => sum + part.price * part.quantity, 0);

  const handleSubmit = async () => {
    const selectedParts = parts.filter((part) => part.selected);

    if (selectedParts.length === 0) {
      alert("Please select at least one spare part");
      return;
    }

    try {
      await onSubmit(selectedParts);

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("spare-parts-requested", {
          serviceName,
          partsCount: selectedParts.length,
          totalAmount: selectedParts.reduce(
            (sum, part) => sum + part.price * part.quantity,
            0
          ),
        });
      }
    } catch (error) {
      console.error("Error submitting spare parts:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Spare Parts / Required Items
          </h2>
          <p className="text-sm text-gray-600 mt-1">Service: {serviceName}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading spare parts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : parts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No spare parts available</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Available Components
              </h3>

              <div className="space-y-3">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100"
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={part.selected}
                        onChange={() => togglePart(part.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <span className="text-sm text-gray-900 block">
                          {part.name}
                        </span>
                        {part.description && (
                          <span className="text-xs text-gray-500 block mt-1">
                            {part.description}
                          </span>
                        )}
                        {part.sku && (
                          <span className="text-xs text-gray-400 block">
                            SKU: {part.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    {part.selected && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">Qty:</span>
                          <button
                            onClick={() => updateQuantity(part.id, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            <RemoveOutlined fontSize="small" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {part.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(part.id, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            <AddOutlined fontSize="small" />
                          </button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{part.price}
                          </div>
                          {part.quantity > 1 && (
                            <div className="text-xs text-gray-500">
                              Total: ₹{part.price * part.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!part.selected && (
                      <div className="text-right min-w-[80px]">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{part.price}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{totalAmount}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <SendOutlined className="mr-2" />
                Submit Quote
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
