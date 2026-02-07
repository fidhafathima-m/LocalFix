"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.reportService = exports.reportRepository = exports.dashboardController = exports.dashboardService = exports.dashboardRepository = exports.walletController = exports.walletService = exports.walletRepository = exports.notificationController = exports.notificationService = exports.notificationRepository = exports.reviewManagementController = exports.reviewMangementService = exports.reviewManagementRepository = exports.orderManagementController = exports.orderManagementService = exports.orderManagementRepository = exports.paymentController = exports.paymentService = exports.paymentRepository = exports.userLocationController = exports.userLocationService = exports.userLocationRepository = exports.userProfileController = exports.userProfileService = exports.addressRepository = exports.addressService = exports.addressController = exports.itemManagementController = exports.itemManagementService = exports.itemManagementRepository = exports.serviceManagementController = exports.serviceManagementService = exports.serviceMangementRepository = exports.categoryManagementController = exports.categoryManagementService = exports.categoryManagementRepository = exports.authService = exports.authController = exports.technicianDashboardService = exports.technicianDashboardController = exports.technicianApplicationRepository = exports.technicianApplicationService = exports.technicianApplicationController = exports.publicUserManagementController = exports.userManagementRepository = exports.userManagementService = exports.userManagementController = exports.createSocketDependentServices = void 0;
exports.technicianManagementSubscriptionController = exports.technicianManagementSubscriptionService = exports.technicianManagementSubscriptionRepository = exports.messageController = exports.messageService = exports.messageRepository = exports.technicianChatController = exports.technicianChatService = exports.chatController = exports.chatService = exports.serviceController = exports.serviceService = exports.technicianSubscriptionController = exports.technicianSubscriptionService = exports.technicianSubscriptionRepository = exports.subscriptionManagementController = exports.subscriptionService = exports.subscriptionRepository = void 0;
const UserManagementRepository_1 = require("../repositories/admin/UserManagementRepository");
const UserManagementService_1 = require("../services/UserManagementService");
const userManagementController_1 = require("../controllers/admin/userManagementController");
const LoggerService_1 = require("../services/LoggerService");
const SocketService_1 = require("../services/SocketService");
const publicUserManagementController_1 = require("../controllers/admin/publicUserManagementController");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const NotificationService_1 = require("../services/NotificationService");
const NotificationController_1 = require("../controllers/NotificationController");
const TechnicianApplicationRepository_1 = require("../repositories/technician/TechnicianApplicationRepository");
const TechnicianRepository_1 = require("../repositories/technician/TechnicianRepository");
const TechnicianDocumentRepository_1 = require("../repositories/technician/TechnicianDocumentRepository");
const UserRepository_1 = require("../repositories/user/UserRepository");
const TechnicianApplicationService_1 = require("../services/TechnicianApplicationService");
const technicianApplicationController_1 = require("../controllers/technician/technicianApplicationController");
const UserAddressRepository_1 = require("../repositories/user/UserAddressRepository");
const TechnicianDashboardService_1 = require("../services/TechnicianDashboardService");
const technicianDashboardController_1 = require("../controllers/technician/technicianDashboardController");
const OTPRepository_1 = require("../repositories/user/OTPRepository");
const SocialAccountRepository_1 = require("../repositories/user/SocialAccountRepository");
const AuthService_1 = require("../services/AuthService");
const authController_1 = require("../controllers/user/authController");
const CategoryManagementRepository_1 = require("../repositories/admin/CategoryManagementRepository");
const CategoryManagementService_1 = require("../services/CategoryManagementService");
const categoryManagementController_1 = require("../controllers/admin/categoryManagementController");
const ServiceManagementRepository_1 = require("../repositories/admin/ServiceManagementRepository");
const ServiceManagementService_1 = require("../services/ServiceManagementService");
const serviceManagementController_1 = require("../controllers/admin/serviceManagementController");
const ItemManagementRepository_1 = require("../repositories/admin/ItemManagementRepository");
const ItemManagementService_1 = require("../services/ItemManagementService");
const itemManagementController_1 = require("../controllers/admin/itemManagementController");
const AddressRepository_1 = require("../repositories/user/AddressRepository");
const AddressService_1 = require("../services/AddressService");
const addressController_1 = require("../controllers/user/addressController");
const UserProfileService_1 = require("../services/UserProfileService");
const userProfileController_1 = require("../controllers/user/userProfileController");
const UserLocationRepository_1 = require("../repositories/user/UserLocationRepository");
const UserLocationService_1 = require("../services/UserLocationService");
const userLocationController_1 = require("../controllers/user/userLocationController");
const PaymentRepository_1 = require("../repositories/user/PaymentRepository");
const PaymentService_1 = require("../services/PaymentService");
const PaymentController_1 = require("../controllers/user/PaymentController");
const OrderManagementRepository_1 = require("../repositories/admin/OrderManagementRepository");
const OrderManagementService_1 = require("../services/OrderManagementService");
const orderManagementController_1 = require("../controllers/admin/orderManagementController");
const ReviewManagementRepository_1 = require("../repositories/admin/ReviewManagementRepository");
const ReviewMangementService_1 = require("../services/ReviewMangementService");
const reviewManagementController_1 = require("../controllers/admin/reviewManagementController");
const PaymentManagementRepository_1 = require("../repositories/admin/PaymentManagementRepository");
const paymentManagementController_1 = require("../controllers/admin/paymentManagementController");
const TechnicianManagemnetRepository_1 = require("../repositories/admin/TechnicianManagemnetRepository");
const TechnicianManagementService_1 = require("../services/TechnicianManagementService");
const technicianManagementController_1 = require("../controllers/admin/technicianManagementController");
const OrderRepository_1 = require("../repositories/user/OrderRepository");
const OrderService_1 = require("../services/OrderService");
const orderController_1 = require("../controllers/user/orderController");
const technicianOrderController_1 = __importDefault(require("../controllers/technician/technicianOrderController"));
const ReviewRepository_1 = require("../repositories/user/ReviewRepository");
const ReviewService_1 = require("../services/ReviewService");
const reviewController_1 = require("../controllers/user/reviewController");
const TechnicianProfileRepository_1 = require("../repositories/technician/TechnicianProfileRepository");
const TechnicianProfileService_1 = require("../services/TechnicianProfileService");
const EmailService_1 = require("../services/EmailService");
const technicianProfileController_1 = require("../controllers/technician/technicianProfileController");
const BookingRepository_1 = require("../repositories/user/BookingRepository");
const BookingService_1 = require("../services/BookingService");
const bookingController_1 = require("../controllers/user/bookingController");
const WalletRepository_1 = require("../repositories/user/WalletRepository");
const WalletService_1 = require("../services/WalletService");
const walletController_1 = require("../controllers/user/walletController");
const DashboardRepository_1 = require("../repositories/admin/DashboardRepository");
const DashboardService_1 = require("../services/DashboardService");
const DashboardController_1 = require("../controllers/admin/DashboardController");
const ReportRepository_1 = require("../repositories/admin/ReportRepository");
const ReportService_1 = require("../services/ReportService");
const reportManagementController_1 = require("../controllers/admin/reportManagementController");
const SparePartsRequestRepository_1 = require("../repositories/technician/SparePartsRequestRepository");
const SparePartsReuestService_1 = require("../services/SparePartsReuestService");
const sparePartsRequestController_1 = require("../controllers/technician/sparePartsRequestController");
const SubscriptionRepository_1 = require("../repositories/admin/SubscriptionRepository");
const SubscriptionManagementService_1 = require("../services/SubscriptionManagementService");
const SubscriptionManagementController_1 = require("../controllers/admin/SubscriptionManagementController");
const technicianSubscriptionController_1 = require("../controllers/technician/technicianSubscriptionController");
const TechnicianSubscriptionRepository_1 = require("../repositories/technician/TechnicianSubscriptionRepository");
const TechnicianSubscriptionService_1 = require("../services/TechnicianSubscriptionService");
const SubscriptionWalletService_1 = require("../services/SubscriptionWalletService");
const SubscriptionPaymentService_1 = require("../services/SubscriptionPaymentService");
const ServiceController_1 = require("../controllers/user/ServiceController");
const ChatService_1 = require("../services/ChatService");
const chatController_1 = require("../controllers/user/chatController");
const TechnicianChatService_1 = require("../services/TechnicianChatService");
const technicianChatController_1 = require("../controllers/technician/technicianChatController");
const MessageRepository_1 = require("../repositories/user/MessageRepository");
const MessageService_1 = require("../services/MessageService");
const messageController_1 = require("../controllers/user/messageController");
const TechnicianManagementSubscriptionRepository_1 = require("../repositories/admin/TechnicianManagementSubscriptionRepository");
const TechnicianManagementSubscriptionService_1 = require("../services/TechnicianManagementSubscriptionService");
const technicianManagementSubscriptionController_1 = require("../controllers/admin/technicianManagementSubscriptionController");
const PaymentMgmtService_1 = require("../services/PaymentMgmtService");
const redis_1 = require("./redis");
const loggerService = new LoggerService_1.LoggerService();
// User Management Dependencies
const userManagementRepository = new UserManagementRepository_1.UserManagementRepository();
exports.userManagementRepository = userManagementRepository;
const userManagementService = new UserManagementService_1.UserManagementService(userManagementRepository, loggerService);
exports.userManagementService = userManagementService;
const userManagementController = new userManagementController_1.UserManagementController(userManagementService, loggerService);
exports.userManagementController = userManagementController;
const publicUserManagementController = new publicUserManagementController_1.PublicUserManagementController(userManagementService, loggerService);
exports.publicUserManagementController = publicUserManagementController;
// Notification dependencies
const notificationRepository = new NotificationRepository_1.NotificationRepository();
exports.notificationRepository = notificationRepository;
const notificationService = new NotificationService_1.NotificationService(notificationRepository, loggerService);
exports.notificationService = notificationService;
const notificationController = new NotificationController_1.NotificationController(notificationService, loggerService);
exports.notificationController = notificationController;
// Technician Application Dependencies
const technicianApplicationRepository = new TechnicianApplicationRepository_1.TechnicianApplicationRepository();
exports.technicianApplicationRepository = technicianApplicationRepository;
const technicianRepository = new TechnicianRepository_1.TechnicianRepository();
const technicianDocumentRepository = new TechnicianDocumentRepository_1.TechnicianDocumentRepository();
const userRepository = new UserRepository_1.UserRepository();
const technicianApplicationService = new TechnicianApplicationService_1.TechnicianApplicationService(technicianApplicationRepository, technicianRepository, technicianDocumentRepository, userRepository, loggerService);
exports.technicianApplicationService = technicianApplicationService;
const technicianApplicationController = new technicianApplicationController_1.TechnicianApplicationController(technicianApplicationService, loggerService);
exports.technicianApplicationController = technicianApplicationController;
// Technician Dashboard Dependencies
const userAddressRepository = new UserAddressRepository_1.UserAddressRepository();
const technicianDashboardService = new TechnicianDashboardService_1.TechnicianDashboardService(technicianRepository, userRepository, userAddressRepository, loggerService);
exports.technicianDashboardService = technicianDashboardService;
const technicianDashboardController = new technicianDashboardController_1.TechnicianDashboardController(technicianDashboardService, loggerService);
exports.technicianDashboardController = technicianDashboardController;
// User authentication dependencies
const otpRepository = new OTPRepository_1.OTPRepository();
const socialAccountRepository = new SocialAccountRepository_1.SocialAccountRepository();
const authService = new AuthService_1.AuthService(userRepository, otpRepository, socialAccountRepository, loggerService);
exports.authService = authService;
const authController = new authController_1.AuthController(authService, loggerService);
exports.authController = authController;
// Category Management dependencies
const categoryManagementRepository = new CategoryManagementRepository_1.CategoryRepository();
exports.categoryManagementRepository = categoryManagementRepository;
const categoryManagementService = new CategoryManagementService_1.CategoryService(categoryManagementRepository, loggerService);
exports.categoryManagementService = categoryManagementService;
const categoryManagementController = new categoryManagementController_1.CategoryManagementController(categoryManagementService, loggerService);
exports.categoryManagementController = categoryManagementController;
// Wallet dependencies
const walletRepository = new WalletRepository_1.WalletRepository();
exports.walletRepository = walletRepository;
const walletService = new WalletService_1.WalletService(walletRepository, loggerService);
exports.walletService = walletService;
const walletController = new walletController_1.WalletController(walletService, loggerService);
exports.walletController = walletController;
// Service Management dependecies
const serviceMangementRepository = new ServiceManagementRepository_1.ServiceRepository();
exports.serviceMangementRepository = serviceMangementRepository;
const serviceManagementService = new ServiceManagementService_1.ServiceService(serviceMangementRepository, loggerService);
exports.serviceManagementService = serviceManagementService;
const serviceManagementController = new serviceManagementController_1.ServiceManagementController(serviceManagementService, loggerService);
exports.serviceManagementController = serviceManagementController;
// Item Management Dependencies
const itemManagementRepository = new ItemManagementRepository_1.ItemRepository();
exports.itemManagementRepository = itemManagementRepository;
const itemManagementService = new ItemManagementService_1.ItemService(itemManagementRepository, loggerService);
exports.itemManagementService = itemManagementService;
const itemManagementController = new itemManagementController_1.ItemManagementController(itemManagementService, loggerService);
exports.itemManagementController = itemManagementController;
// User Profile
const addressRepository = new AddressRepository_1.AddressRepository();
exports.addressRepository = addressRepository;
const addressService = new AddressService_1.AddressService(addressRepository, loggerService);
exports.addressService = addressService;
const addressController = new addressController_1.AddressController(addressService, loggerService);
exports.addressController = addressController;
const userProfileService = new UserProfileService_1.UserProfileService(userManagementRepository, addressRepository, loggerService);
exports.userProfileService = userProfileService;
const userProfileController = new userProfileController_1.UserProfileController(userProfileService, loggerService);
exports.userProfileController = userProfileController;
// User Location
const userLocationRepository = new UserLocationRepository_1.UserLocationRepository();
exports.userLocationRepository = userLocationRepository;
const userLocationService = new UserLocationService_1.UserLocationService(userLocationRepository, loggerService);
exports.userLocationService = userLocationService;
const userLocationController = new userLocationController_1.UserLocationController(userLocationService, loggerService);
exports.userLocationController = userLocationController;
const bookingRepository = new BookingRepository_1.BookingRepository();
const redisService = new redis_1.RedisService();
const sparePartsRequestRepositry = new SparePartsRequestRepository_1.SparePartsRequestRepository();
const orderRepository = new OrderRepository_1.OrderRepository();
// Payment dependencies
const paymentRepository = new PaymentRepository_1.PaymentRepository();
exports.paymentRepository = paymentRepository;
const paymentService = new PaymentService_1.PaymentService(paymentRepository, loggerService, walletRepository, bookingRepository, sparePartsRequestRepositry, orderRepository, redisService);
exports.paymentService = paymentService;
const paymentController = new PaymentController_1.PaymentController(paymentService, loggerService);
exports.paymentController = paymentController;
// Order managemnet dependencies
const orderManagementRepository = new OrderManagementRepository_1.OrderManagementRepository();
exports.orderManagementRepository = orderManagementRepository;
const orderManagementService = new OrderManagementService_1.OrderManagementService(orderManagementRepository, loggerService);
exports.orderManagementService = orderManagementService;
const orderManagementController = new orderManagementController_1.OrderManagementController(orderManagementService, loggerService);
exports.orderManagementController = orderManagementController;
// Review managemnet dependencies
const reviewManagementRepository = new ReviewManagementRepository_1.ReviewManagementRepository();
exports.reviewManagementRepository = reviewManagementRepository;
const reviewMangementService = new ReviewMangementService_1.ReviewManagementService(reviewManagementRepository, loggerService);
exports.reviewMangementService = reviewMangementService;
const reviewManagementController = new reviewManagementController_1.ReviewManagementController(reviewMangementService, loggerService);
exports.reviewManagementController = reviewManagementController;
// Admin dashboard dependencies
const dashboardRepository = new DashboardRepository_1.DashboardRepository();
exports.dashboardRepository = dashboardRepository;
const dashboardService = new DashboardService_1.DashboardService(dashboardRepository, loggerService);
exports.dashboardService = dashboardService;
const dashboardController = new DashboardController_1.DashboardController(dashboardService, loggerService);
exports.dashboardController = dashboardController;
// Admin report dependencies
const reportRepository = new ReportRepository_1.ReportRepository();
exports.reportRepository = reportRepository;
const reportService = new ReportService_1.ReportService(reportRepository, loggerService);
exports.reportService = reportService;
const reportController = new reportManagementController_1.ReportController(reportService, loggerService);
exports.reportController = reportController;
// subscription dependencies
const subscriptionRepository = new SubscriptionRepository_1.SubscriptionRepository();
exports.subscriptionRepository = subscriptionRepository;
const subscriptionService = new SubscriptionManagementService_1.SubscriptionService(subscriptionRepository);
exports.subscriptionService = subscriptionService;
const subscriptionManagementController = new SubscriptionManagementController_1.SubscriptionManagementController(subscriptionService, loggerService);
exports.subscriptionManagementController = subscriptionManagementController;
const subscriptionWalletService = new SubscriptionWalletService_1.SubscriptionWalletService(loggerService);
const subscriptionPaymentService = new SubscriptionPaymentService_1.SubscriptionPaymentService(loggerService);
const technicianSubscriptionRepository = new TechnicianSubscriptionRepository_1.TechnicianSubscriptionRepository();
exports.technicianSubscriptionRepository = technicianSubscriptionRepository;
const technicianSubscriptionService = new TechnicianSubscriptionService_1.TechnicianSubscriptionService(subscriptionService, technicianSubscriptionRepository, subscriptionWalletService, subscriptionPaymentService, loggerService);
exports.technicianSubscriptionService = technicianSubscriptionService;
const technicianSubscriptionController = new technicianSubscriptionController_1.TechnicianSubscriptionController(subscriptionService, technicianSubscriptionService);
exports.technicianSubscriptionController = technicianSubscriptionController;
const serviceService = new ServiceManagementService_1.ServiceService(serviceMangementRepository, loggerService);
exports.serviceService = serviceService;
const serviceController = new ServiceController_1.UserServiceController(serviceService, loggerService);
exports.serviceController = serviceController;
const chatService = new ChatService_1.ChatService(loggerService);
exports.chatService = chatService;
const chatController = new chatController_1.ChatController(chatService, loggerService);
exports.chatController = chatController;
const technicianChatService = new TechnicianChatService_1.TechnicianChatService(loggerService);
exports.technicianChatService = technicianChatService;
const technicianChatController = new technicianChatController_1.TechnicianChatController(technicianChatService, loggerService);
exports.technicianChatController = technicianChatController;
const messageRepository = new MessageRepository_1.MessageRepository();
exports.messageRepository = messageRepository;
const messageService = new MessageService_1.MessageService(messageRepository);
exports.messageService = messageService;
const messageController = new messageController_1.MessageController(messageService, loggerService);
exports.messageController = messageController;
const technicianManagementSubscriptionRepository = new TechnicianManagementSubscriptionRepository_1.TechnicianManagementSubscriptionRepository();
exports.technicianManagementSubscriptionRepository = technicianManagementSubscriptionRepository;
const technicianManagementSubscriptionService = new TechnicianManagementSubscriptionService_1.TechnicianManagementSubscriptionService(technicianManagementSubscriptionRepository, loggerService);
exports.technicianManagementSubscriptionService = technicianManagementSubscriptionService;
const technicianManagementSubscriptionController = new technicianManagementSubscriptionController_1.TechnicianManagementSubscriptionController(technicianManagementSubscriptionService, loggerService);
exports.technicianManagementSubscriptionController = technicianManagementSubscriptionController;
const createSocketDependentServices = (server) => {
    const socketService = new SocketService_1.SocketService(server, notificationService, messageService);
    const technicianManagementRepository = new TechnicianManagemnetRepository_1.TechnicianManagementRepository();
    const technicianManagementService = new TechnicianManagementService_1.TechnicianManagementService(technicianManagementRepository, socketService, loggerService);
    const technicianManagementController = new technicianManagementController_1.TechnicianManagementController(technicianManagementService, loggerService);
    // Payment dependencies
    const paymentManagementRepository = new PaymentManagementRepository_1.PaymentManagementRepository();
    const paymentManagementService = new PaymentMgmtService_1.PaymentManagementService(paymentManagementRepository, loggerService, walletService, socketService);
    const paymentManagementController = new paymentManagementController_1.PaymentManagementController(paymentManagementService, loggerService);
    const orderService = new OrderService_1.OrderService(orderRepository, technicianRepository, socketService, messageService, loggerService);
    const orderController = new orderController_1.OrderController(orderService, loggerService);
    const technicianOrderController = new technicianOrderController_1.default(orderService, loggerService);
    const reviewRepository = new ReviewRepository_1.ReviewRepository();
    const reviewService = new ReviewService_1.ReviewService(reviewRepository, loggerService, socketService);
    const reviewController = new reviewController_1.ReviewController(reviewService, reviewRepository, loggerService);
    const emailService = new EmailService_1.EmailService();
    const technicianProfileRepository = new TechnicianProfileRepository_1.TechnicianProfileRepository();
    const technicianProfileService = new TechnicianProfileService_1.TechnicianProfileService(technicianRepository, technicianProfileRepository, userRepository, userAddressRepository, orderService, emailService, notificationService, loggerService);
    const technicianProfileController = new technicianProfileController_1.TechnicianProfileController(technicianProfileService, loggerService);
    const bookingRepository = new BookingRepository_1.BookingRepository();
    const bookingService = new BookingService_1.BookingService(bookingRepository, orderRepository, loggerService, redisService);
    const bookingController = new bookingController_1.BookingController(bookingService, loggerService);
    // Spare parts request dependencies
    const sparePartsRequestService = new SparePartsReuestService_1.SparePartsRequestService(sparePartsRequestRepositry, orderRepository, technicianRepository, socketService, loggerService);
    const sparePartsRequestController = new sparePartsRequestController_1.SparePartsRequestController(sparePartsRequestService, loggerService);
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
    };
};
exports.createSocketDependentServices = createSocketDependentServices;
