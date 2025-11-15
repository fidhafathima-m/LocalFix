import React from "react";
import {
  FmdGoodOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  AddOutlined,
} from "@mui/icons-material";
import type { Address } from "../../../../../interface/user/IUserApi";

interface AddressSectionProps {
  addresses: Address[];
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefaultAddress: (addressId: string) => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Saved Addresses</h2>
        <button
          onClick={onAddAddress}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
        >
          <AddOutlined className="w-4 h-4" />
          <span className="text-sm">Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={onEditAddress}
              onDelete={onDeleteAddress}
              onSetDefault={onSetDefaultAddress}
            />
          ))
        ) : (
          <EmptyAddressState onAddAddress={onAddAddress} />
        )}
      </div>
    </div>
  );
};

const AddressCard: React.FC<{
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}> = ({ address, onEdit, onDelete, onSetDefault }) => (
  <div
    className={`border rounded-lg p-4 ${
      address.isDefault ? "border-blue-500 bg-blue-50" : "border-gray-200"
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center space-x-2">
        <FmdGoodOutlined className="w-5 h-5 text-blue-600" />
        <span className="font-semibold">{address.label}</span>
        {address.isDefault && (
          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Default
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-gray-600 hover:text-blue-600 text-sm cursor-pointer"
            title="Set as default"
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="text-gray-600 hover:text-blue-600 cursor-pointer"
          title="Edit address"
        >
          <EditOutlined className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="text-gray-600 hover:text-red-600 cursor-pointer"
          title="Delete address"
        >
          <DeleteOutlineOutlined className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-gray-600">{address.street}</p>
      <p className="text-sm text-gray-600">
        {address.city}, {address.state} - {address.pincode}
      </p>
      {address.landmark && (
        <p className="text-sm text-gray-500">Landmark: {address.landmark}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Added on {new Date(address.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const EmptyAddressState: React.FC<{ onAddAddress: () => void }> = ({
  onAddAddress,
}) => (
  <div className="col-span-2 text-center py-8">
    <FmdGoodOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-500">No addresses saved yet</p>
    <button
      onClick={onAddAddress}
      className="mt-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
    >
      Add your first address
    </button>
  </div>
);
