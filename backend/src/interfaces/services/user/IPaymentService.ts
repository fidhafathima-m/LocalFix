import {
  CreatePaymentRequest,
  PaymentResponseDto,
} from "@/interfaces/user/IPayment";
import { ApiResponse } from "@/utils/responseHelper";

export interface IPaymentService {
  createPaymentOrder(
    paymentData: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponseDto>>;
  verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<any>>;
}
