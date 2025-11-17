// services/technician/SparePartsRequestService.ts
import { Types } from 'mongoose';
import { SparePartsRequestRepository } from '../repositories/technician/SparePartsRequestRepository';
import { IOrderRepository } from '../interfaces/repository/user/IOrderRepository';
import { ITechnicianRepository } from '../interfaces/repository/technician/ITechnicianRepository';
import { ResponseHelper, ApiResponse } from '../utils/responseHelper';
import { ILogger } from '../interfaces/utils/ILogger';
import { ISparePartRequestService } from '../interfaces/services/technician/ISparePartsRequestService';
import { ISparePartsRequestRepository } from '../interfaces/repository/technician/ISparePartsRequestRepository';
import {
  CreateSparePartsRequestDto,
  SparePartsRequestResponseDto,
  UpdateSparePartsRequestDto,
} from '../interfaces/dtos/sparePartsRequestDtos';
import { SocketService } from './SocketService';

export class SparePartsRequestService implements ISparePartRequestService {
  private _repository: ISparePartsRequestRepository;
  private _orderRepository: IOrderRepository;
  private _technicianRepository: ITechnicianRepository;
  private _socketService: SocketService;
  private _logger: ILogger;

  constructor(
    repository: ISparePartsRequestRepository,
    orderRepository: IOrderRepository,
    technicianRepository: ITechnicianRepository,
    socketService: SocketService,
    logger: ILogger
  ) {
    this._repository = repository;
    this._orderRepository = orderRepository;
    this._technicianRepository = technicianRepository;
    this._socketService = socketService;
    this._logger = logger;
  }

  async createSparePartsRequest(
    createDto: CreateSparePartsRequestDto
  ): Promise<ApiResponse<SparePartsRequestResponseDto>> {
    const context = {
      operation: 'createSparePartsRequest',
      data: createDto,
    };

    try {
      this._logger.info('Creating spare parts request', context);

      // Validate ObjectId format first
      const isValidObjectIdFormat = (id: string) =>
        /^[0-9a-fA-F]{24}$/.test(id);

      if (!isValidObjectIdFormat(createDto.orderId)) {
        return ResponseHelper.badRequest('Invalid order ID format');
      }
      if (!isValidObjectIdFormat(createDto.technicianId)) {
        return ResponseHelper.badRequest('Invalid technician ID format');
      }
      for (const item of createDto.items) {
        if (!isValidObjectIdFormat(item.itemId)) {
          return ResponseHelper.badRequest(
            `Invalid item ID format: ${item.itemId}`
          );
        }
      }

      // Validate order exists and get customer ID
      const order = await this._orderRepository.findById(createDto.orderId);
      if (!order) {
        this._logger.warn('Order not found', context);
        return ResponseHelper.notFound('Order not found');
      }

      // Extract customer ID properly with type safety
      let customerId: string;

      if (order.userId && typeof order.userId === 'object') {
        // If userId is a populated object, get the _id from it
        const userObj = order.userId as any;
        customerId = userObj._id?.toString() || userObj.id?.toString();
      } else if (order.userId) {
        // If userId is already a string, ObjectId, or other primitive
        customerId = String(order.userId);
      } else {
        this._logger.warn('No userId found in order', {
          orderId: createDto.orderId,
        });
        return ResponseHelper.badRequest('No user ID found in order');
      }

      // Validate we got a valid customer ID
      if (!customerId || !isValidObjectIdFormat(customerId)) {
        this._logger.warn('Invalid customer ID extracted from order', {
          orderId: createDto.orderId,
          userId: order.userId,
          extractedCustomerId: customerId,
        });
        return ResponseHelper.badRequest('Invalid customer ID in order');
      }

      // Validate technician exists
      const technician = await this._technicianRepository.findById(
        createDto.technicianId
      );
      if (!technician) {
        this._logger.warn('Technician not found', context);
        return ResponseHelper.notFound('Technician not found');
      }

      // Calculate total amount
      const totalAmount = createDto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Convert string IDs to ObjectId for storage
      const items = createDto.items.map(item => ({
        itemId: new Types.ObjectId(item.itemId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      }));

      // Create spare parts request with ObjectId
      const sparePartsRequest = await this._repository.create({
        orderId: new Types.ObjectId(createDto.orderId),
        technicianId: new Types.ObjectId(createDto.technicianId),
        customerId: new Types.ObjectId(customerId),
        items,
        totalAmount,
        technicianNotes: createDto.technicianNotes,
        status: 'pending',
        history: [
          {
            status: 'pending',
            actionBy: 'technician',
            notes: 'Spare parts requested by technician',
            timestamp: new Date(),
          },
        ],
      });

      // Add initial history
      await this._repository.addHistory(sparePartsRequest.id.toString(), {
        status: 'pending',
        actionBy: 'technician',
        notes: 'Spare parts requested by technician',
      });

      // Send real-time notification to customer
      try {
        await this._socketService.notifySparePartsRequest(
          customerId,
          technician.displayName, // Use technician's display name
          order.serviceName || 'Service', // Get service name from order
          createDto.orderId,
          totalAmount,
          items.length,
          sparePartsRequest.id.toString() // Pass the request ID
        );
        this._logger.info('Spare parts notification sent successfully');
      } catch (notificationError) {
        this._logger.warn('Failed to send notification', {
          error: notificationError,
          customerId,
          orderId: createDto.orderId,
        });
        // Don't fail the request if notification fails
      }

      this._logger.info('Spare parts request created successfully', {
        ...context,
        requestId: sparePartsRequest.id.toString(),
        totalAmount,
        itemsCount: items.length,
      });

      const responseDto = this.mapToDto(sparePartsRequest);
      return ResponseHelper.created(
        'Spare parts request created successfully',
        responseDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating spare parts request', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to create spare parts request');
    }
  }
  async getSparePartsRequestsByOrder(
    orderId: string
  ): Promise<ApiResponse<SparePartsRequestResponseDto[]>> {
    const context = {
      operation: 'getSparePartsRequestsByOrder',
      orderId,
    };

    try {
      this._logger.info('Fetching spare parts requests for order', context);

      const requests = await this._repository.findByOrderId(orderId);

      this._logger.info('Spare parts requests retrieved successfully', {
        ...context,
        count: requests.length,
      });

      const responseDtos = requests.map(request => this.mapToDto(request));
      return ResponseHelper.success(
        'Spare parts requests retrieved successfully',
        responseDtos
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching spare parts requests', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to fetch spare parts requests');
    }
  }

  async updateSparePartsRequestStatus(
    requestId: string,
    updateDto: UpdateSparePartsRequestDto,
    actionBy: 'customer' | 'technician'
  ): Promise<ApiResponse<SparePartsRequestResponseDto>> {
    const context = {
      operation: 'updateSparePartsRequestStatus',
      requestId,
      updateDto,
      actionBy,
    };

    try {
      this._logger.info('Updating spare parts request status', context);

      const existingRequest = await this._repository.findById(requestId);
      if (!existingRequest) {
        this._logger.warn('Spare parts request not found', context);
        return ResponseHelper.notFound('Spare parts request not found');
      }

      // Update status
      const updatedRequest = await this._repository.updateStatus(
        requestId,
        updateDto.status,
        updateDto.customerNotes
      );

      if (!updatedRequest) {
        this._logger.error(
          'Failed to update spare parts request status',
          context
        );
        return ResponseHelper.error(
          'Failed to update spare parts request status'
        );
      }

      // Add to history
      await this._repository.addHistory(requestId, {
        status: updateDto.status,
        actionBy,
        notes:
          updateDto.customerNotes ||
          `Request ${updateDto.status} by ${actionBy}`,
      });

      this._logger.info('Spare parts request status updated successfully', {
        ...context,
        newStatus: updateDto.status,
      });

      const responseDto = this.mapToDto(updatedRequest);
      return ResponseHelper.success(
        'Spare parts request status updated successfully',
        responseDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating spare parts request status', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error(
        'Failed to update spare parts request status'
      );
    }
  }

  private mapToDto(request: any): SparePartsRequestResponseDto {
    return {
      _id: request._id.toString(),
      orderId: request.orderId._id?.toString() || request.orderId.toString(),
      technicianId: {
        _id:
          request.technicianId._id?.toString() ||
          request.technicianId.toString(),
        displayName: request.technicianId.displayName,
        phone: request.technicianId.phone,
      },
      customerId: request.customerId.toString(),
      items: request.items.map((item: any) => ({
        itemId: item.itemId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      totalAmount: request.totalAmount,
      status: request.status,
      technicianNotes: request.technicianNotes,
      customerNotes: request.customerNotes,
      requestedAt: request.requestedAt.toISOString(),
      respondedAt: request.respondedAt?.toISOString(),
    };
  }
}
