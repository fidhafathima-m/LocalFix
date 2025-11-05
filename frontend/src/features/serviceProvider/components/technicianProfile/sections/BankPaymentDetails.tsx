import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import { TechnicianService } from "../../../../../services/technician/technicianService";
import toast from "react-hot-toast";
import type { TechnicianProfile } from "../../../../../interface/technician/ITechnicianApi";

interface BankAccount {
  holderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

interface PaymentDetailsData {
  bankAccount: BankAccount;
  upiId?: string;
  withdrawalPreference: "auto" | "manual";
}

const BankPaymentDetails = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentDetailsData>({
    bankAccount: {
      holderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    upiId: "",
    withdrawalPreference: "auto",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TechnicianService.getProfile();

      if (response.success) {
        const profileData =
          response.data?.data?.profile ||
          response.data?.profile ||
          response.data?.data ||
          response.data ||
          response;

        const paymentDetails = profileData.paymentDetails || {};

        const bankAccount = paymentDetails.bankAccount || {};

        setFormData({
          bankAccount: {
            holderName: bankAccount.holderName || "",
            accountNumber: bankAccount.accountNumber || "",
            ifscCode: bankAccount.ifscCode || "",
            bankName: bankAccount.bankName || "",
          },
          upiId: paymentDetails.upiId || "",
          withdrawalPreference: paymentDetails.withdrawalPreference || "auto",
        });

        setProfile(profileData);
      } else {
        console.error("API response not successful:", response);
        setError("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Error loading payment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBankAccountChange = (field: keyof BankAccount, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value,
      },
    }));
  };

  const handleUpiIdChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      upiId: value,
    }));
  };

  const handleWithdrawalPreferenceChange = (preference: "auto" | "manual") => {
    setFormData((prev) => ({
      ...prev,
      withdrawalPreference: preference,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!formData.bankAccount.holderName?.trim()) {
        setError("Please enter bank account holder name");
        return;
      }

      if (!formData.bankAccount.accountNumber?.trim()) {
        setError("Please enter account number");
        return;
      }

      if (!formData.bankAccount.ifscCode?.trim()) {
        setError("Please enter IFSC code");
        return;
      }

      if (!validateIfscCode(formData.bankAccount.ifscCode)) {
        setError("Please enter a valid IFSC code");
        return;
      }

      if (formData.upiId && !validateUpiId(formData.upiId)) {
        setError("Please enter a valid UPI ID");
        return;
      }

      const updateData = {
        paymentDetails: {
          bankAccount: {
            holderName: formData.bankAccount.holderName.trim(),
            accountNumber: formData.bankAccount.accountNumber.trim(),
            ifscCode: formData.bankAccount.ifscCode.trim().toUpperCase(),
            bankName: formData.bankAccount.bankName?.trim() || "",
          },
          upiId: formData.upiId?.trim() || "",
          withdrawalPreference: formData.withdrawalPreference,
        },
      };

      const response = await TechnicianService.updateBankPayment(updateData);

      if (response.success) {
        // Update local state
        setFormData(updateData.paymentDetails);

        if (profile) {
          setProfile({
            ...profile,
            paymentDetails: updateData.paymentDetails,
          });
        }

        setError(null);
        toast.success("Bank and payment details updated successfully!");

        // Refresh the data
        await fetchProfile();
      } else {
        console.error("Save failed:", response);
        toast.error(
          response.message ||
            "Failed to update payment details. Please try again."
        );
        setError(
          response.message ||
            "Failed to update payment details. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating bank payment details:", error);
      toast.error("Failed to update payment details. Please try again.");
      setError("Failed to update payment details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return "";
    const firstTwo = accountNumber.slice(0, 2);
    const lastFour = accountNumber.slice(-4);
    const maskedLength = accountNumber.length - 6;
    const masked = "•".repeat(maskedLength > 0 ? maskedLength : 0);
    return `${firstTwo}${masked}${lastFour}`;
  };

  const validateUpiId = (upiId: string) => {
    if (!upiId) return true;
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  };

  const validateIfscCode = (ifscCode: string) => {
    if (!ifscCode) return false;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifscCode.toUpperCase());
  };

  if (loading) {
    return (
      <AccordionSection title="Bank & Payment Details" number={5}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading payment details...</span>
        </div>
      </AccordionSection>
    );
  }

  const isFormValid =
    formData.bankAccount.holderName?.trim() &&
    formData.bankAccount.accountNumber?.trim() &&
    formData.bankAccount.ifscCode?.trim() &&
    validateIfscCode(formData.bankAccount.ifscCode) &&
    validateUpiId(formData.upiId || "");

  return (
    <AccordionSection title="Bank & Payment Details" number={5}>
      <div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bank Account Holder Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Account Holder Name *
            </label>
            <input
              type="text"
              value={formData.bankAccount.holderName}
              onChange={(e) =>
                handleBankAccountChange("holderName", e.target.value)
              }
              placeholder="Enter account holder name as per bank records"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Account Number *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.bankAccount.accountNumber}
                onChange={(e) =>
                  handleBankAccountChange(
                    "accountNumber",
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter account number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={18}
              />
              {formData.bankAccount.accountNumber && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {maskAccountNumber(formData.bankAccount.accountNumber)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Numbers only, no spaces or special characters
            </p>
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium mb-1">
              IFSC Code *
            </label>
            <input
              type="text"
              value={formData.bankAccount.ifscCode}
              onChange={(e) =>
                handleBankAccountChange(
                  "ifscCode",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="Enter IFSC code"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.bankAccount.ifscCode &&
                !validateIfscCode(formData.bankAccount.ifscCode)
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              maxLength={11}
            />
            {formData.bankAccount.ifscCode &&
              !validateIfscCode(formData.bankAccount.ifscCode) && (
                <p className="text-xs text-red-500 mt-1">
                  Please enter a valid IFSC code (e.g., SBIN0000123)
                </p>
              )}
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bankAccount.bankName}
              onChange={(e) =>
                handleBankAccountChange("bankName", e.target.value)
              }
              placeholder="Enter bank name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* UPI ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              UPI ID (optional)
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => handleUpiIdChange(e.target.value)}
              placeholder="username@paytm / username@ybl / etc."
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.upiId && !validateUpiId(formData.upiId)
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {formData.upiId && !validateUpiId(formData.upiId) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid UPI ID (e.g., username@paytm)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              For instant payments. Format: username@provider
            </p>
          </div>
        </div>

        {/* Withdrawal Preferences */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Withdrawal Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="radio"
                id="auto-withdrawal"
                name="withdrawal"
                checked={formData.withdrawalPreference === "auto"}
                onChange={() => handleWithdrawalPreferenceChange("auto")}
                className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="auto-withdrawal" className="flex-1">
                <div className="font-medium">Automatic weekly withdrawal</div>
                <p className="text-xs text-gray-600 mt-1">
                  Your earnings will be automatically transferred to your bank
                  account every Monday
                </p>
              </label>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="radio"
                id="manual-withdrawal"
                name="withdrawal"
                checked={formData.withdrawalPreference === "manual"}
                onChange={() => handleWithdrawalPreferenceChange("manual")}
                className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="manual-withdrawal" className="flex-1">
                <div className="font-medium">Manual withdrawal request</div>
                <p className="text-xs text-gray-600 mt-1">
                  You need to manually request withdrawals when you want to
                  transfer funds
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className={`px-6 py-2 rounded font-medium flex items-center ${
              saving || !isFormValid
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </AccordionSection>
  );
};

export default BankPaymentDetails;
