import { LocalPhoneOutlined, PinDropOutlined } from "@mui/icons-material";

interface CustomerInformationProps {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address: any;
  orderId: string;
}

const CustomerInformation: React.FC<CustomerInformationProps> = ({
  customerInfo,
  address,
}) => {
  const handleCallCustomer = () => {
    window.location.href = `tel:${customerInfo.phone}`;
  };

  const handleViewOnMap = () => {
    if (address?.latitude && address?.longitude) {
      const mapUrl = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
      window.open(mapUrl, "_blank");
    } else if (address?.street && address?.city) {
      const addressString = `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        addressString
      )}`;
      window.open(mapUrl, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customer Information
      </h3>
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
          {customerInfo.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-900">{customerInfo.name}</p>
          <p className="text-sm text-gray-500">{customerInfo.email}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Contact via app</p>
          <button
            onClick={handleCallCustomer}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <LocalPhoneOutlined className="mr-2" />
            Call Customer
          </button>
        </div>
        <div>
          <div className="flex items-start text-gray-700">
            <PinDropOutlined className="mr-2 mt-1 text-gray-500" />
            <div>
              <p className="text-sm">
                {address ? (
                  <>
                    {address.street && <span>{address.street}, </span>}
                    {address.city && <span>{address.city}, </span>}
                    {address.state && <span>{address.state}</span>}
                    {address.pincode && <span> - {address.pincode}</span>}
                    {!address.street &&
                      !address.city &&
                      "Address not available"}
                  </>
                ) : (
                  "Address not available"
                )}
              </p>
              <button
                onClick={handleViewOnMap}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-1"
              >
                View on Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInformation;
