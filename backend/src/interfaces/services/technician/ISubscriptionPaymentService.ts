export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, any>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  paymentId: string;
  orderId: string;
}

export interface ISubscriptionPaymentService {
  createRazorpayOrder(
    orderData: RazorpayOrderRequest
  ): Promise<RazorpayOrderResponse>;
  verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<PaymentVerificationResult>;
}
