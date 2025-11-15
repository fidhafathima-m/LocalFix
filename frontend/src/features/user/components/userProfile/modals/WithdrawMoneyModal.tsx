// components/user/wallet/WithdrawMoneyModal.tsx
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
  Alert,
} from "@mui/material";
import {
  CloseOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { walletService } from "../../../../../services/user/walletService";

interface WithdrawMoneyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  walletBalance: number;
}

export const WithdrawMoneyModal: React.FC<WithdrawMoneyModalProps> = ({
  open,
  onClose,
  onSuccess,
  walletBalance,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleWithdraw = async () => {
    try {
      setError("");
      const numericAmount = parseFloat(amount);

      if (!numericAmount || numericAmount < 100) {
        setError("Minimum withdrawal amount is ₹100");
        return;
      }

      if (numericAmount > walletBalance) {
        setError("Insufficient wallet balance");
        return;
      }

      setLoading(true);

      const response = await walletService.withdrawMoney({
        amount: numericAmount,
      });

      if (response.success) {
        onSuccess(numericAmount);
        onClose();
        // Show success toast
      } else {
        setError(response.message || "Withdrawal failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      setError(error.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWalletOutlined color="primary" />
            <Typography variant="h6">Withdraw Money</Typography>
          </Box>
          <Button onClick={handleClose} size="small">
            <CloseOutlined />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box py={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Available Balance: <strong>₹{walletBalance}</strong>
          </Alert>

          {/* Amount Input */}
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Withdrawal Amount
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <Typography mr={1}>₹</Typography>,
              }}
            />
            <Typography variant="caption" color="textSecondary">
              Minimum: ₹100 | Maximum: ₹{walletBalance}
            </Typography>
          </Box>

          {/* Withdrawal Summary */}
          {amount && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                Withdrawal Summary
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Withdrawal Amount:</Typography>
                <Typography variant="body2">₹{amount}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight="bold">
                  New Balance:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₹{(walletBalance - parseFloat(amount)).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleWithdraw}
          variant="contained"
          disabled={!amount || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Processing..." : "Withdraw Money"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
