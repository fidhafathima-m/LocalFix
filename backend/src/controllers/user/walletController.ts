// controllers/WalletController.ts
import { Request, Response } from "express";
import { ResponseHelper } from "../../utils/responseHelper";
import { IWalletService } from "../../interfaces/services/user/IWalletService";
import { ILogger } from "../../interfaces/utils/ILogger";

export class WalletController {
  private _walletService: IWalletService;
  private _logger: ILogger;

  constructor(walletService: IWalletService, logger: ILogger) {
    this._walletService = walletService;
    this._logger = logger;
  }

  getWalletBalance = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const context = {
      operation: "getWalletBalance",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Fetching wallet balance", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const result = await this._walletService.getWalletBalance(userId);

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Get wallet balance error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to fetch wallet balance"));
    }
  };

  createAddMoneyOrder = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { amount, currency } = req.body;

    const context = {
      operation: "createAddMoneyOrder",
      userId,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Creating add money order", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!amount) {
        return res.status(400).json(ResponseHelper.error("Amount is required"));
      }

      const result = await this._walletService.createAddMoneyOrder(userId, {
        amount,
        currency,
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Create add money order error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to create order"));
    }
  };

  verifyAddMoneyPayment = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const context = {
      operation: "verifyAddMoneyPayment",
      userId,
      orderId: razorpay_order_id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Verifying add money payment", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res
          .status(400)
          .json(ResponseHelper.error("Payment verification data is required"));
      }

      const result = await this._walletService.verifyAddMoneyPayment(userId, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Verify add money payment error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to verify payment"));
    }
  };

  withdrawMoney = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { amount, bankAccountId } = req.body;

    const context = {
      operation: "withdrawMoney",
      userId,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Processing withdrawal", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!amount) {
        return res.status(400).json(ResponseHelper.error("Amount is required"));
      }

      const result = await this._walletService.withdrawMoney(userId, {
        amount,
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Withdraw money error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to process withdrawal"));
    }
  };

  getWalletTransactions = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: "getWalletTransactions",
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Fetching wallet transactions", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const result = await this._walletService.getWalletTransactions(
        userId,
        page,
        limit,
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Get wallet transactions error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to fetch wallet transactions"));
    }
  };

  getBankAccounts = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const context = {
      operation: "getBankAccounts",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Fetching bank accounts", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const result = await this._walletService.getBankAccounts(userId);

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Get bank accounts error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to fetch bank accounts"));
    }
  };

  addBankAccount = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { accountNumber, accountHolderName, bankName, ifscCode, isDefault } =
      req.body;

    const context = {
      operation: "addBankAccount",
      userId,
      bankName,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Adding bank account", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!accountNumber || !accountHolderName || !bankName || !ifscCode) {
        return res
          .status(400)
          .json(ResponseHelper.error("All bank account details are required"));
      }

      const result = await this._walletService.addBankAccount(userId, {
        accountNumber,
        accountHolderName,
        bankName,
        ifscCode,
        isDefault: isDefault || false,
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Add bank account error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to add bank account"));
    }
  };

  setDefaultBankAccount = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { accountId } = req.params;

    const context = {
      operation: "setDefaultBankAccount",
      userId,
      accountId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Setting default bank account", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!accountId) {
        return res
          .status(400)
          .json(ResponseHelper.error("Account ID is required"));
      }

      const result = await this._walletService.setDefaultBankAccount(
        userId,
        accountId,
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Set default bank account error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to set default bank account"));
    }
  };

  deleteBankAccount = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { accountId } = req.params;

    const context = {
      operation: "deleteBankAccount",
      userId,
      accountId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Deleting bank account", context);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!accountId) {
        return res
          .status(400)
          .json(ResponseHelper.error("Account ID is required"));
      }

      const result = await this._walletService.deleteBankAccount(
        userId,
        accountId,
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Delete bank account error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
      });
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to delete bank account"));
    }
  };
}
