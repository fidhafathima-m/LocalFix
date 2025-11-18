export interface RazorpayOrderResponse {
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
    key: string;
  };
  subscription: {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
  };
}

export interface WalletPaymentResponse {
  success: boolean;
  subscription: any;
  transaction: any;
  newBalance: number;
}

export interface ITechnicianSubscriptionService {
  createRazorpayOrder(
    subscriptionId: string,
    userId: string
  ): Promise<RazorpayOrderResponse>;
  processWalletPayment(
    subscriptionId: string,
    userId: string
  ): Promise<WalletPaymentResponse>;
  verifyAndActivateSubscription(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    subscriptionId: string,
    userId: string
  ): Promise<any>;
  checkSubscriptionEligibility(
    technicianId: string,
    subscriptionId: string
  ): Promise<any>;
  getCurrentSubscription(technicianId: string): Promise<any>;
  getSubscriptionHistory(technicianId: string): Promise<any[]>;
  getSubscriptionPurchaseById(
    purchaseId: string,
    technicianId: string
  ): Promise<any>;
}
