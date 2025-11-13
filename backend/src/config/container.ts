import { UserManagementRepository } from "../repositories/admin/UserManagementRepository";
import { UserManagementService } from "../services/UserManagementService";
import { UserManagementController } from "../controllers/admin/userManagementController";

import { TechnicianManagementRepository } from "../repositories/admin/TechnicianManagemnetRepository";
import { TechnicianManagementService } from "../services/TechnicianManagementService";
import { TechnicianManagementController } from "../controllers/admin/technicianManagementController";
import { TechnicianApplicationRepository } from "../repositories/technician/TechnicianApplicationRepository";
import { TechnicianApplicationService } from "../services/TechnicianApplicationService";
import { TechnicianApplicationController } from "../controllers/technician/technicianApplicationController";
import { TechnicianRepository } from "../repositories/technician/TechnicianRepository";
import { TechnicianDocumentRepository } from "../repositories/technician/TechnicianDocumentRepository";
import { UserRepository } from "../repositories/user/UserRepository";
import { UserAddressRepository } from "../repositories/user/UserAddressRepository";
import { TechnicianDashboardService } from "../services/TechnicianDashboardService";
import { TechnicianDashboardController } from "../controllers/technician/technicianDashboardController";
import { OTPRepository } from "../repositories/user/OTPRepository";
import { SocialAccountRepository } from "../repositories/user/SocialAccountRepository";
import { AuthService } from "../services/AuthService";
import { AuthController } from "../controllers/user/authController";
import { TechnicianProfileRepository } from "../repositories/technician/TechnicianProfileRepository";
import { TechnicianProfileService } from "../services/TechnicianProfileService";
import { TechnicianProfileController } from "../controllers/technician/technicianProfileController";
import { CategoryRepository } from "../repositories/admin/CategoryManagementRepository";
import { CategoryService } from "../services/CategoryManagementService";
import { CategoryManagementController } from "../controllers/admin/categoryManagementController";
import { ServiceRepository } from "../repositories/admin/ServiceManagementRepository";
import { ServiceService } from "../services/ServiceManagementService";
import { ServiceManagementController } from "../controllers/admin/serviceManagementController";
import { ItemRepository } from "../repositories/admin/ItemManagementRepository";
import { ItemManagementController } from "../controllers/admin/itemManagementController";
import { PublicUserManagementController } from "../controllers/admin/publicUserManagementController";
import { UserProfileService } from "../services/UserProfileService";
import { UserProfileController } from "../controllers/user/userProfileController";
import { UserLocationService } from "../services/UserLocationService";
import { UserLocationController } from "../controllers/user/userLocationController";
import { UserLocationRepository } from "../repositories/user/UserLocationRepository";
import { AddressRepository } from "../repositories/user/AddressRepository";
import { AddressController } from "../controllers/user/addressController";
import { AddressService } from "../services/AddressService";
import { ItemService } from "../services/ItemManagementService";
import { BookingRepository } from "../repositories/user/BookingRepository";
import { BookingService } from "../services/BookingService";
import { BookingController } from "../controllers/user/bookingController";
import { PaymentRepository } from "../repositories/user/PaymentRepository";
import { PaymentService } from "../services/PaymentService";
import { PaymentController } from "../controllers/user/PaymentController";
import { OrderRepository } from "../repositories/user/OrderRepository";
import { OrderService } from "../services/OrderService";
import { OrderController } from "../controllers/user/orderController";
import TechnicianBookingController from "../controllers/technician/technicianOrderController";
import TechnicianOrderController from "../controllers/technician/technicianOrderController";
import { OrderManagementRepository } from "../repositories/admin/OrderManagementRepository";
import { OrderManagementService } from "../services/OrderManagementService";
import { OrderManagementController } from "../controllers/admin/orderManagementController";
import { ReviewRepository } from "../repositories/user/ReviewRepository";
import { ReviewService } from "../services/ReviewService";
import { ReviewController } from "../controllers/user/reviewController";
import { ReviewManagementService } from "../services/ReviewMangementService";
import { ReviewManagementController } from "../controllers/admin/reviewManagementController";
import { ReviewManagementRepository } from "../repositories/admin/ReviewManagementRepository";
import { PaymentManagementRepository } from "../repositories/admin/PaymentManagementRepository";
import { PaymentManagementService } from "../services/paymentManagementService";
import { PaymentManagementController } from "../controllers/admin/paymentManagementController";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";
import { NotificationController } from "../controllers/INotificationController";
import { emailService } from "../services/EmailService";
import { LoggerService } from "@/services/LoggerService";

const loggerService = new LoggerService();

// User Management Dependencies
const userManagementRepository = new UserManagementRepository();
const userManagementService = new UserManagementService(
  userManagementRepository,
  loggerService
);
const userManagementController = new UserManagementController(
  userManagementService,
  loggerService
);
const publicUserManagementController = new PublicUserManagementController(
  userManagementService,
  loggerService
);

// Notification dependencies
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(
  notificationRepository,
  loggerService
);
const notificationController = new NotificationController(
  notificationService,
  loggerService
);

// Technician Management Dependencies
const technicianManagementRepository = new TechnicianManagementRepository();
const technicianManagementService = new TechnicianManagementService(
  technicianManagementRepository,
  notificationService,
  loggerService
);
const technicianManagementController = new TechnicianManagementController(
  technicianManagementService,
  loggerService
);

// Technician Application Dependencies
const technicianApplicationRepository = new TechnicianApplicationRepository();
const technicianRepository = new TechnicianRepository();
const technicianDocumentRepository = new TechnicianDocumentRepository();
const userRepository = new UserRepository();
const technicianApplicationService = new TechnicianApplicationService(
  technicianApplicationRepository,
  technicianRepository,
  technicianDocumentRepository,
  userRepository,
  loggerService
);
const technicianApplicationController = new TechnicianApplicationController(
  technicianApplicationService,
  loggerService
);

// Technician Dashboard Dependencies
const userAddressRepository = new UserAddressRepository();
const technicianDashboardService = new TechnicianDashboardService(
  technicianRepository,
  userRepository,
  userAddressRepository,
  loggerService
);
const technicianDashboardController = new TechnicianDashboardController(
  technicianDashboardService,
  loggerService
);

// Order dependencies
const orderRepository = new OrderRepository();
const orderService = new OrderService(
  orderRepository,
  technicianRepository,
  notificationService,
  loggerService
);
const orderController = new OrderController(orderService, loggerService);
const technicianOrderController = new TechnicianOrderController(
  orderService,
  loggerService
);

// User authentication dependencies
const otpRepository = new OTPRepository();
const socialAccountRepository = new SocialAccountRepository();
const authService = new AuthService(
  userRepository,
  otpRepository,
  socialAccountRepository,
  loggerService
);
const authController = new AuthController(authService, loggerService);

// Technician profile dependencies
const technicianProfileRepository = new TechnicianProfileRepository();
const technicianProfileService = new TechnicianProfileService(
  technicianRepository,
  technicianProfileRepository,
  userRepository,
  userAddressRepository,
  orderService,
  emailService,
  notificationService,
  loggerService
);
const technicianProfileController = new TechnicianProfileController(
  technicianProfileService,
  loggerService
);

// Category Management dependencies
const categoryManagementRepository = new CategoryRepository();
const categoryManagementService = new CategoryService(
  categoryManagementRepository,
  loggerService
);
const categoryManagementController = new CategoryManagementController(
  categoryManagementService,
  loggerService
);

// Service Management dependecies
const serviceMangementRepository = new ServiceRepository();
const serviceManagementService = new ServiceService(
  serviceMangementRepository,
  loggerService
);
const serviceManagementController = new ServiceManagementController(
  serviceManagementService,
  loggerService
);

// Item Management Dependencies
const itemManagementRepository = new ItemRepository();
const itemManagementService = new ItemService(
  itemManagementRepository,
  loggerService
);
const itemManagementController = new ItemManagementController(
  itemManagementService,
  loggerService
);

// User Profile
const addressRepository = new AddressRepository();
const addressService = new AddressService(addressRepository, loggerService);
const addressController = new AddressController(addressService, loggerService);
const userProfileService = new UserProfileService(
  userManagementRepository,
  addressRepository,
  loggerService
);
const userProfileController = new UserProfileController(
  userProfileService,
  loggerService
);

// User Location
const userLocationRepository = new UserLocationRepository();
const userLocationService = new UserLocationService(
  userLocationRepository,
  loggerService
);
const userLocationController = new UserLocationController(
  userLocationService,
  loggerService
);

// Payment dependencies
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository, loggerService);
const paymentController = new PaymentController(paymentService, loggerService);

// Booking dependencies
const bookingRepository = new BookingRepository();
const bookingService = new BookingService(
  bookingRepository,
  orderRepository,
  loggerService
);
const bookingController = new BookingController(bookingService, loggerService);

// Order managemnet dependencies
const orderManagementRepository = new OrderManagementRepository();
const orderManagementService = new OrderManagementService(
  orderManagementRepository,
  loggerService
);
const orderManagementController = new OrderManagementController(
  orderManagementService,
  loggerService
);

// Review dependencies
const reviewRepository = new ReviewRepository();
const reviewService = new ReviewService(
  reviewRepository,
  notificationService,
  loggerService
);
const reviewController = new ReviewController(
  reviewService,
  reviewRepository,
  loggerService
);

// Review managemnet dependencies
const reviewManagementRepository = new ReviewManagementRepository();
const reviewMangementService = new ReviewManagementService(
  reviewManagementRepository,
  loggerService
);
const reviewManagementController = new ReviewManagementController(
  reviewMangementService,
  loggerService
);

// Payment dependencies
const paymentManagementRepository = new PaymentManagementRepository();
const paymentManagementService = new PaymentManagementService(
  paymentManagementRepository,
  loggerService
);
const paymentManagementController = new PaymentManagementController(
  paymentManagementService,
  loggerService
);

export {
  userManagementController,
  userManagementService,
  userManagementRepository,
  publicUserManagementController,
  technicianManagementController,
  technicianManagementService,
  technicianManagementRepository,
  technicianApplicationController,
  technicianApplicationService,
  technicianApplicationRepository,
  technicianDashboardController,
  technicianDashboardService,
  authController,
  authService,
  technicianProfileController,
  technicianProfileService,
  technicianProfileRepository,
  categoryManagementRepository,
  categoryManagementService,
  categoryManagementController,
  serviceMangementRepository,
  serviceManagementService,
  serviceManagementController,
  itemManagementRepository,
  itemManagementService,
  itemManagementController,
  addressController,
  addressService,
  addressRepository,
  userProfileService,
  userProfileController,
  userLocationRepository,
  userLocationService,
  userLocationController,
  bookingRepository,
  bookingService,
  bookingController,
  technicianOrderController,
  paymentRepository,
  paymentService,
  paymentController,
  orderRepository,
  orderService,
  orderController,
  orderManagementRepository,
  orderManagementService,
  orderManagementController,
  reviewRepository,
  reviewService,
  reviewController,
  reviewManagementRepository,
  reviewMangementService,
  reviewManagementController,
  paymentManagementRepository,
  paymentManagementService,
  paymentManagementController,
  notificationRepository,
  notificationService,
  notificationController,
};
