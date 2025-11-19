import { Request, Response } from 'express';
import { ILogger } from '../../interfaces/utils/ILogger';
import { ISparePartRequestService } from '../../interfaces/services/technician/ISparePartsRequestService';
import { ResponseHelper } from '../../utils/responseHelper';
import { AuthRequest } from '../../middleware/authMiddleware';

export class SparePartsRequestController {
  private _service: ISparePartRequestService;
  private _logger: ILogger;

  constructor(service: ISparePartRequestService, logger: ILogger) {
    this._service = service;
    this._logger = logger;
  }

  createSparePartsRequest = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const createDto = req.body;
    const context = {
      operation: 'createSparePartsRequest',
      data: createDto,
    };

    try {
      this._logger.info('Creating spare parts request', context);

      const result = await this._service.createSparePartsRequest(createDto);

      res.status(result.statusCode).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Controller error creating spare parts request', {
        ...context,
        error: errorMessage,
      });
      const response = ResponseHelper.error(
        'Failed to create spare parts request'
      );
      res.status(response.statusCode).json(response);
    }
  };

  getSparePartsRequestsByOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { orderId } = req.params;
    const context = {
      operation: 'getSparePartsRequestsByOrder',
      orderId,
    };

    try {
      this._logger.info('Fetching spare parts requests for order', context);

      const result = await this._service.getSparePartsRequestsByOrder(orderId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Controller error fetching spare parts requests', {
        ...context,
        error: errorMessage,
      });
      const response = ResponseHelper.error(
        'Failed to fetch spare parts requests'
      );
      res.status(response.statusCode).json(response);
    }
  };

  updateSparePartsRequestStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { requestId } = req.params;
    const updateDto = req.body;
    const context = {
      operation: 'updateSparePartsRequestStatus',
      requestId,
      updateDto,
    };

    try {
      this._logger.info('Updating spare parts request status', context);

      // Determine who is making the request (customer or technician)
      const actionBy =
        req.user?.currentRole === 'technician' ? 'technician' : 'customer';

      const result = await this._service.updateSparePartsRequestStatus(
        requestId,
        updateDto,
        actionBy
      );

      res.status(result.statusCode).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error(
        'Controller error updating spare parts request status',
        {
          ...context,
          error: errorMessage,
        }
      );
      const response = ResponseHelper.error(
        'Failed to update spare parts request status'
      );
      res.status(response.statusCode).json(response);
    }
  };
}
