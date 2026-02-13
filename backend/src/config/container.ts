import { UserManagementRepository } from '../repositories/admin/UserManagementRepository';
import { UserManagementService } from '../services/UserManagementService';
import { UserManagementController } from '../controllers/admin/userManagementController';

import { LoggerService } from '../services/LoggerService';
import { SocketService } from '../services/SocketService';
import { PublicUserManagementController } from '../controllers/admin/publicUserManagementController';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationService } from '../services/NotificationService';
import { NotificationController } from '../controllers/NotificationController';
import { TechnicianApplicationRepository } from '../repositories/technician/TechnicianApplicationRepository';
import { TechnicianRepository } from '../repositories/technician/TechnicianRepository';
import { TechnicianDocumentRepository } from '../repositories/technician/TechnicianDocumentRepository';
import { UserRepository } from '../repositories/user/UserRepository';
import { TechnicianApplicationService } from '../services/TechnicianApplicationService';
import { TechnicianApplicationController } from '../controllers/technician/technicianApplicationController';
import { UserAddressRepository } from '../repositories/user/UserAddressRepository';
import { TechnicianDashboardService } from '../services/TechnicianDashboardService';
import { TechnicianDashboardController } from '../controllers/technician/technicianDashboardController';
import { OTPRepository } from '../repositories/user/OTPRepository';
import { SocialAccountRepository } from '../repositories/user/SocialAccountRepository';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/user/authController';
import { CategoryRepository } from '../repositories/admin/CategoryManagementRepository';
import { CategoryService } from '../services/CategoryManagementService';
import { CategoryManagementController } from '../controllers/admin/categoryManagementController';
import { ServiceRepository } from '../repositories/admin/ServiceManagementRepository';
import { ServiceService } from '../services/ServiceManagementService';
import { ServiceManagementController } from '../controllers/admin/serviceManagementController';
import { ItemRepository } from '../repositories/admin/ItemManagementRepository';
import { ItemService } from '../services/ItemManagementService';
import { ItemManagementController } from '../controllers/admin/itemManagementController';
import { AddressRepository } from '../repositories/user/AddressRepository';
import { AddressService } from '../services/AddressService';
import { AddressController } from '../controllers/user/addressController';
import { UserProfileService } from '../services/UserProfileService';
import { UserProfileController } from '../controllers/user/userProfileController';
import { UserLocationRepository } from '../repositories/user/UserLocationRepository';
import { UserLocationService } from '../services/UserLocationService';
import { UserLocationController } from '../controllers/user/userLocationController';
import { PaymentRepository } from '../repositories/user/PaymentRepository';
import { PaymentService } from '../services/PaymentService';
import { PaymentController } from '../controllers/user/PaymentController';
import { OrderManagementRepository } from '../repositories/admin/OrderManagementRepository';
import { OrderManagementService } from '../services/OrderManagementService';
import { OrderManagementController } from '../controllers/admin/orderManagementController';
import { ReviewManagementRepository } from '../repositories/admin/ReviewManagementRepository';
import { ReviewManagementService } from '../services/ReviewMangementService';
import { ReviewManagementController } from '../controllers/admin/reviewManagementController';
import { PaymentManagementRepository } from '../repositories/admin/PaymentManagementRepository';
import { PaymentManagementController } from '../controllers/admin/paymentManagementController';
import { TechnicianManagementRepository } from '../repositories/admin/TechnicianManagemnetRepository';
import { TechnicianManagementService } from '../services/TechnicianManagementService';
import { TechnicianManagementController } from '../controllers/admin/technicianManagementController';
import { OrderRepository } from '../repositories/user/OrderRepository';
import { OrderService } from '../services/OrderService';
import { OrderController } from '../controllers/user/orderController';
import TechnicianOrderController from '../controllers/technician/technicianOrderController';
import { ReviewRepository } from '../repositories/user/ReviewRepository';
import { ReviewService } from '../services/ReviewService';
import { ReviewController } from '../controllers/user/reviewController';
import { TechnicianProfileRepository } from '../repositories/technician/TechnicianProfileRepository';
import { TechnicianProfileService } from '../services/TechnicianProfileService';
import { EmailService } from '../services/EmailService';
import { TechnicianProfileController } from '../controllers/technician/technicianProfileController';
import { BookingRepository } from '../repositories/user/BookingRepository';
import { BookingService } from '../services/BookingService';
import { BookingController } from '../controllers/user/bookingController';
import { WalletRepository } from '../repositories/user/WalletRepository';
import { WalletService } from '../services/WalletService';
import { WalletController } from '../controllers/user/walletController';
import { DashboardRepository } from '../repositories/admin/DashboardRepository';
import { DashboardService } from '../services/DashboardService';
import { DashboardController } from '../controllers/admin/DashboardController';
import { ReportRepository } from '../repositories/admin/ReportRepository';
import { ReportService } from '../services/ReportService';
import { ReportController } from '../controllers/admin/reportManagementController';
import { SparePartsRequestRepository } from '../repositories/technician/SparePartsRequestRepository';
import { SparePartsRequestService } from '../services/SparePartsReuestService';
import { SparePartsRequestController } from '../controllers/technician/sparePartsRequestController';
import { SubscriptionRepository } from '../repositories/admin/SubscriptionRepository';
import { SubscriptionService } from '../services/SubscriptionManagementService';
import { SubscriptionManagementController } from '../controllers/admin/SubscriptionManagementController';
import { TechnicianSubscriptionController } from '../controllers/technician/technicianSubscriptionController';
import { TechnicianSubscriptionRepository } from '../repositories/technician/TechnicianSubscriptionRepository';
import { TechnicianSubscriptionService } from '../services/TechnicianSubscriptionService';
import { SubscriptionWalletService } from '../services/SubscriptionWalletService';
import { SubscriptionPaymentService } from '../services/SubscriptionPaymentService';
import { UserServiceController } from '../controllers/user/ServiceController';
import { ChatService } from '../services/ChatService';
import { ChatController } from '../controllers/user/chatController';
import { TechnicianChatService } from '../services/TechnicianChatService';
import { TechnicianChatController } from '../controllers/technician/technicianChatController';
import { MessageRepository } from '../repositories/user/MessageRepository';
import { MessageService } from '../services/MessageService';
import { MessageController } from '../controllers/user/messageController';
import { TechnicianManagementSubscriptionRepository } from '../repositories/admin/TechnicianManagementSubscriptionRepository';
import { TechnicianManagementSubscriptionService } from '../services/TechnicianManagementSubscriptionService';
import { TechnicianManagementSubscriptionController } from '../controllers/admin/technicianManagementSubscriptionController';
import { PaymentManagementService } from '../services/PaymentMgmtService';
import { RedisService } from './redis';
import { CronService } from '../services/CronService';

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

// Wallet dependencies
const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository, loggerService);
const walletController = new WalletController(walletService, loggerService);

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

const bookingRepository = new BookingRepository();

const redisService = new RedisService();

const sparePartsRequestRepositry = new SparePartsRequestRepository();
const orderRepository = new OrderRepository();
// Payment dependencies
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(
  paymentRepository,
  loggerService,
  walletRepository,
  bookingRepository,
  sparePartsRequestRepositry,
  orderRepository,
  redisService
);
const paymentController = new PaymentController(paymentService, loggerService);

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

// Admin dashboard dependencies
const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(
  dashboardRepository,
  loggerService
);
const dashboardController = new DashboardController(
  dashboardService,
  loggerService
);

// Admin report dependencies
const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository, loggerService);
const reportController = new ReportController(reportService, loggerService);

// subscription dependencies
const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionManagementController = new SubscriptionManagementController(
  subscriptionService,
  loggerService
);

const subscriptionWalletService = new SubscriptionWalletService(loggerService);
const subscriptionPaymentService = new SubscriptionPaymentService(
  loggerService
);

const technicianSubscriptionRepository = new TechnicianSubscriptionRepository();
const technicianSubscriptionService = new TechnicianSubscriptionService(
  subscriptionService,
  technicianSubscriptionRepository,
  subscriptionWalletService,
  subscriptionPaymentService,
  loggerService
);
const technicianSubscriptionController = new TechnicianSubscriptionController(
  subscriptionService,
  technicianSubscriptionService
);

const serviceService = new ServiceService(
  serviceMangementRepository,
  loggerService
);
const serviceController = new UserServiceController(
  serviceService,
  loggerService
);

const chatService = new ChatService(loggerService);
const chatController = new ChatController(chatService, loggerService);

const technicianChatService = new TechnicianChatService(loggerService);
const technicianChatController = new TechnicianChatController(
  technicianChatService,
  loggerService
);

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService, loggerService);

const technicianManagementSubscriptionRepository =
  new TechnicianManagementSubscriptionRepository();
const technicianManagementSubscriptionService =
  new TechnicianManagementSubscriptionService(
    technicianManagementSubscriptionRepository,
    loggerService
  );
const technicianManagementSubscriptionController =
  new TechnicianManagementSubscriptionController(
    technicianManagementSubscriptionService,
    loggerService
  );

export const createSocketDependentServices = (server: any) => {
  const socketService = new SocketService(
    server,
    notificationService,
    messageService
  );

  const technicianManagementRepository = new TechnicianManagementRepository();
  const technicianManagementService = new TechnicianManagementService(
    technicianManagementRepository,
    socketService,
    loggerService
  );
  const technicianManagementController = new TechnicianManagementController(
    technicianManagementService,
    loggerService
  );

  // Payment dependencies
  const paymentManagementRepository = new PaymentManagementRepository();
  const paymentManagementService = new PaymentManagementService(
    paymentManagementRepository,
    loggerService,
    walletService,
    socketService
  );
  const paymentManagementController = new PaymentManagementController(
    paymentManagementService,
    loggerService
  );
  const orderService = new OrderService(
    orderRepository,
    technicianRepository,
    socketService,
    messageService,
    walletService,
    loggerService
  );
  const orderController = new OrderController(orderService, loggerService);
  const technicianOrderController = new TechnicianOrderController(
    orderService,
    loggerService
  );

  const reviewRepository = new ReviewRepository();
  const reviewService = new ReviewService(
    reviewRepository,
    loggerService,
    socketService
  );
  const reviewController = new ReviewController(
    reviewService,
    reviewRepository,
    loggerService
  );

  const emailService = new EmailService();

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

  const bookingRepository = new BookingRepository();
  const bookingService = new BookingService(
    bookingRepository,
    orderRepository,
    loggerService,
    redisService
  );
  const bookingController = new BookingController(
    bookingService,
    loggerService
  );

  // Spare parts request dependencies
  const sparePartsRequestService = new SparePartsRequestService(
    sparePartsRequestRepositry,
    orderRepository,
    technicianRepository,
    socketService,
    loggerService
  );
  const sparePartsRequestController = new SparePartsRequestController(
    sparePartsRequestService,
    loggerService
  );

  const cronService = new CronService(orderService, loggerService);

  return {
    socketService,
    technicianManagementService,
    technicianManagementController,
    orderService,
    orderController,
    technicianOrderController,
    reviewService,
    reviewController,
    technicianProfileService,
    technicianProfileController,
    bookingService,
    bookingController,
    paymentManagementRepository,
    paymentManagementService,
    paymentManagementController,
    sparePartsRequestRepositry,
    sparePartsRequestService,
    sparePartsRequestController,
    cronService,
  };
};

// Export services that don't need SocketService
export {
  userManagementController,
  userManagementService,
  userManagementRepository,
  publicUserManagementController,
  technicianApplicationController,
  technicianApplicationService,
  technicianApplicationRepository,
  technicianDashboardController,
  technicianDashboardService,
  authController,
  authService,
  OrderService,
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
  paymentRepository,
  paymentService,
  paymentController,
  orderManagementRepository,
  orderManagementService,
  orderManagementController,
  reviewManagementRepository,
  reviewMangementService,
  reviewManagementController,
  notificationRepository,
  notificationService,
  notificationController,
  walletRepository,
  walletService,
  walletController,
  dashboardRepository,
  dashboardService,
  dashboardController,
  reportRepository,
  reportService,
  reportController,
  subscriptionRepository,
  subscriptionService,
  subscriptionManagementController,
  technicianSubscriptionRepository,
  technicianSubscriptionService,
  technicianSubscriptionController,
  serviceService,
  serviceController,
  chatService,
  chatController,
  technicianChatService,
  technicianChatController,
  messageRepository,
  messageService,
  messageController,
  technicianManagementSubscriptionRepository,
  technicianManagementSubscriptionService,
  technicianManagementSubscriptionController,
};
