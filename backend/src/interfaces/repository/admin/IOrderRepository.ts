import { IOrder } from "../../user/IOrder";
import { FilterQuery, Types } from "mongoose";

export interface IOrderRepository {
  findAll(
    filter?: FilterQuery<IOrder>,
    skip?: number,
    limit?: number
  ): Promise<IOrder[]>;
  
  findById(orderId: string | Types.ObjectId): Promise<IOrder | null>;
  
  count(filter?: FilterQuery<IOrder>): Promise<number>;
  
  update(
    orderId: string | Types.ObjectId,
    updateData: Partial<IOrder>
  ): Promise<IOrder | null>;
  
  search(query: string, limit?: number): Promise<IOrder[]>;
  
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }>;
}