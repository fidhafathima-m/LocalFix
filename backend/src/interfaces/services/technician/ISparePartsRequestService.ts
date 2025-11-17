import { ApiResponse } from '../../../utils/responseHelper';
import {
  CreateSparePartsRequestDto,
  SparePartsRequestResponseDto,
  UpdateSparePartsRequestDto,
} from '../../dtos/sparePartsRequestDtos';

export interface ISparePartRequestService {
  createSparePartsRequest(
    createDto: CreateSparePartsRequestDto
  ): Promise<ApiResponse<SparePartsRequestResponseDto>>;
  getSparePartsRequestsByOrder(
    orderId: string
  ): Promise<ApiResponse<SparePartsRequestResponseDto[]>>;
  updateSparePartsRequestStatus(
    requestId: string,
    updateDto: UpdateSparePartsRequestDto,
    actionBy: 'customer' | 'technician'
  ): Promise<ApiResponse<SparePartsRequestResponseDto>>;
}
