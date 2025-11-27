import { CreatePaymentRequest, PaymentResponseDto } from '../../user/IPayment';
import { ApiResponse } from '../../../utils/responseHelper';

export interface IPaymentService {
  createPaymentOrder(
    paymentData: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponseDto>>;
  verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<any>>;
  processWalletPayment(
    userId: string,
    bookingId: string,
    amount: number
  ): Promise<ApiResponse<any>>;
  refundToWallet(
    userId: string,
    bookingId: string,
    amount: number,
    reason: string
  ): Promise<ApiResponse<any>>;
  processSparePartsWalletPayment(
    userId: string,
    orderId: string,
    requestId: string,
    amount: number
  ): Promise<ApiResponse<any>>;
}
