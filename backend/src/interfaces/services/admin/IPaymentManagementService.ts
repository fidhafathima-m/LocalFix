import {
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentStatsDto,
  RefundRequestDto,
} from "../../dtos/paymentDtos";

export interface IPaymentService {
  getPayments(
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentListResponseDto>;

  getPaymentById(paymentId: string): Promise<PaymentResponseDto>;

  getPaymentStats(): Promise<PaymentStatsDto>;

  processRefund(paymentId: string, refundData?: RefundRequestDto): Promise<void>;

  exportPayments(
    format: 'csv' | 'excel',
    filters?: any
  ): Promise<{ data: Buffer; filename: string }>;
}