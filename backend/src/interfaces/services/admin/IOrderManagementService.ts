import { 
  OrderResponseDto, 
  OrderListResponseDto, 
  OrderStatsDto, 
  UpdateOrderStatusDto 
} from "../../dtos/orderDtos";

export interface IOrderService {
  getOrders(
    page?: number, 
    limit?: number, 
    search?: string, 
    status?: string
  ): Promise<OrderListResponseDto>;
  
  getOrderById(orderId: string): Promise<OrderResponseDto>;
  
  getOrderStats(): Promise<OrderStatsDto>;
  
  updateOrderStatus(
    orderId: string, 
    updateData: UpdateOrderStatusDto
  ): Promise<OrderResponseDto>;

  getOrdersByTechnician(
    technicianId: string,
    page?: number,
    limit?: number
  ): Promise<OrderListResponseDto>;
}