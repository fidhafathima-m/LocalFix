export interface ILocationTrackingService {
  startLocationSharing(
    technicianId: string,
    orderId: string,
    location: { lat: number; lng: number; accuracy?: number }
  ): Promise<any>;
  updateTechnicianLocation(
    technicianId: string,
    orderId: string,
    location: {
      lat: number;
      lng: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
    }
  ): Promise<any>;
  stopLocationSharing(technicianId: string, orderId: string): Promise<any>;
  getLiveTrackingData(orderId: string): Promise<any>;
  getLocationHistory(orderId: string): Promise<any>;
}
