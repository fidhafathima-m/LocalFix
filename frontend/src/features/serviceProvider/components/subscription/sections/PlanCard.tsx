import { Check } from "@mui/icons-material";

interface PlanCardProps {
  id: string;
  name: string;
  price: string;
  duration: string;
  commission: string;
  features: string[];
  isPopular?: boolean;
  onSubscribe: () => void;
}

export function PlanCard({
  name,
  price,
  duration,
  commission,
  features,
  isPopular = false,
  onSubscribe,
}: PlanCardProps) {
  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border-2 ${
        isPopular
          ? "border-blue-500 shadow-lg transform scale-105"
          : "border-gray-200"
      } p-6 flex flex-col h-full`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">{duration}</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{commission}</span>{" "}
            commission rate
          </p>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSubscribe}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isPopular
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
      >
        Subscribe Now
      </button>
    </div>
  );
}
