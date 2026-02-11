import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware';

export const createBookingRoutes = (bookingController: any) => {
  const router = Router();

  // Booking routes
  router.post('/', protect, bookingController.createBooking);
  router.get('/user', protect, bookingController.getUserBookings);
  router.get('/:bookingId', protect, bookingController.getBookingById);
  router.post('/:bookingId/cancel', protect, bookingController.cancelBooking);
  router.put('/:bookingId', protect, bookingController.updateBooking);
  router.patch(
    '/:bookingId/status',
    protect,
    bookingController.updateBookingStatus
  );

  router.get(
    '/:bookingId/tracking',
    protect,
    bookingController.getTrackingDetails
  );
  router.get(
    '/:bookingId/technician-location',
    protect,
    bookingController.getTechnicianLocation
  );
  router.post(
    '/check-availability',
    protect,
    bookingController.checkTechnicianAvailability
  );
  router.get(
    '/technician/:technicianId/date/:date',
    protect,
    bookingController.getTechnicianBookingsForDate
  );

  return router;
};

export default createBookingRoutes;
