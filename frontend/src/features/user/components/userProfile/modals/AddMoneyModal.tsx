/* eslint-disable @typescript-eslint/no-explicit-any */
// components/user/wallet/AddMoneyModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  CloseOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { walletService } from "../../../../../services/user/walletService";

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handlePresetAmountClick = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setAmount(value);
    }
  };

  const handleProceedToPay = async () => {
    try {
      setError("");
      const numericAmount = parseFloat(amount);

      if (!numericAmount || numericAmount < 10) {
        setError("Minimum amount is ₹10");
        return;
      }

      if (numericAmount > 100000) {
        setError("Maximum amount is ₹1,00,000");
        return;
      }

      setLoading(true);

      // Create Razorpay order - send amount in rupees, NOT paise
      const orderResponse = await walletService.createAddMoneyOrder({
        amount: numericAmount, // Send rupees, NOT paise
        currency: "INR",
      });

      if (!orderResponse.success) {
        throw new Error("Failed to create order");
      }

      // Rest of your code remains the same...
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderResponse.data.key,
          amount: orderResponse.data.amount, // This will be in paise from backend
          currency: orderResponse.data.currency,
          name: "LocalFix",
          description: "Add money to wallet",
          order_id: orderResponse.data.orderId,
          handler: async function (response: any) {
            try {
              const verificationResponse =
                await walletService.verifyAddMoneyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

              if (verificationResponse.success) {
                onSuccess(numericAmount);
                onClose();
                // You might want to show a success toast here
              } else {
                setError("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              setError("Payment verification failed");
            }
          },
          prefill: {
            // You can prefill user details if available
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
    } catch (error: any) {
      console.error("Add money error:", error);
      setError(error.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setCustomAmount("");
    setError("");
    setLoading(false);
    onClose();
  };

  const selectedAmount = customAmount || amount;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWalletOutlined color="primary" />
            <Typography variant="h6">Add Money to Wallet</Typography>
          </Box>
          <Button onClick={handleClose} size="small">
            <CloseOutlined />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box py={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Choose an amount to add to your wallet
          </Typography>

          {/* Preset Amounts */}
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Select
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {presetAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant={
                    amount === presetAmount.toString()
                      ? "contained"
                      : "outlined"
                  }
                  size="small"
                  onClick={() => handlePresetAmountClick(presetAmount)}
                  disabled={loading}
                >
                  ₹{presetAmount}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Custom Amount */}
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Or enter custom amount
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <Typography mr={1}>₹</Typography>,
              }}
            />
          </Box>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          {selectedAmount && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="body2">
                Amount to add: <strong>₹{selectedAmount}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleProceedToPay}
          variant="contained"
          disabled={!selectedAmount || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
