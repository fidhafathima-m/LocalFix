  import { UserManagementRepository } from "../repositories/admin/UserManagementRepository";
  import { UserManagementService } from "../services/UserManagementService";
  import { UserManagementController } from "../controllers/admin/userManagement";

  import { TechnicianManagementRepository } from "../repositories/admin/TechnicianManagemnetRepository";
  import { TechnicianManagementService } from "../services/TechnicianManagementService";
  import { TechnicianManagementController } from "../controllers/admin/technicianManagement";
  import { TechnicianApplicationRepository } from "../repositories/technician/TechnicianApplicationRepository";
  import { TechnicianApplicationService } from "../services/TechnicianApplicationService";
  import { TechnicianApplicationController } from "../controllers/technician/technicianApplication";
  import { TechnicianRepository } from "../repositories/technician/TechnicianRepository";
  import { TechnicianDocumentRepository } from "../repositories/technician/TechnicianDocumentRepository";
  import { UserRepository } from "../repositories/user/UserRepository";
  import { UserAddressRepository } from "../repositories/user/UserAddressRepository";
  import { TechnicianDashboardService } from "../services/TechnicianDashboardService";
  import { TechnicianDashboardController } from "../controllers/technician/technicianDashboard";
  import { OTPRepository } from "../repositories/user/OTPRepository";
  import { SocialAccountRepository } from "../repositories/user/SocialAccountRepository";
  import { AuthService } from "../services/AuthService";
  import { AuthController } from "../controllers/user/authController";
  import { TechnicianProfileRepository } from "../repositories/technician/TechnicianProfileRepository";
  import { TechnicianProfileService } from "../services/TechnicianProfileService";
  import { TechnicianProfileController } from "../controllers/technician/technicianProfile";
  import { CategoryRepository } from "../repositories/admin/CategoryManagementRepository";
  import { CategoryService } from "../services/CategoryManagementService";
  import { CategoryController } from "../controllers/admin/categoryManagement";
  import { ServiceRepository } from "../repositories/admin/ServiceManagementRepository";
  import { ServiceService } from "../services/ServiceManagementService";
  import { ServiceController } from "../controllers/admin/serviceManagement";
  import { ItemRepository } from "../repositories/admin/ItemManagementRepository";
  import { ItemService } from "../services/ItemManagementService";
  import { ItemController } from "../controllers/admin/itemManagementController";
  import { PublicUserController } from "../controllers/admin/publicUserManagement";
  import { UserProfileService } from "../services/UserProfileService";
  import { UserProfileController } from "../controllers/user/userProfileController";
  import { UserLocationService } from "../services/UserLocationService"; // FIXED: Import the class
  import { UserLocationController } from "../controllers/user/userLocationController";
  import { UserLocationRepository } from "../repositories/user/UserLocationRepository";
import { AddressRepository } from "../repositories/user/AddressRepository";
import { AddressController } from "../controllers/user/addressController";
import { AddressService } from "../services/AddressService";

  // User Management Dependencies
  const userManagementRepository = new UserManagementRepository();
  const userManagementService = new UserManagementService(
    userManagementRepository
  );
  const userManagementController = new UserManagementController(
    userManagementService
  );
  const publicUserManagementController = new PublicUserController(userManagementService);

  // Technician Management Dependencies
  const technicianManagementRepository = new TechnicianManagementRepository();
  const technicianManagementService = new TechnicianManagementService(
    technicianManagementRepository
  );
  const technicianManagementController = new TechnicianManagementController(
    technicianManagementService
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
  );
  const technicianApplicationController = new TechnicianApplicationController(
    technicianApplicationService
  );

  // Technician Dashboard Dependencies
  const userAddressRepository = new UserAddressRepository();
  const technicianDashboardService = new TechnicianDashboardService(
    technicianRepository,
    userRepository,
    userAddressRepository
  );
  const technicianDashboardController = new TechnicianDashboardController(
    technicianDashboardService
  );

  // User authentication dependencies
  const otpRepository = new OTPRepository();
  const socialAccountRepository = new SocialAccountRepository();
  const authService = new AuthService(
    userRepository,
    otpRepository,
    socialAccountRepository
  );
  const authController = new AuthController(authService);

  // Technician profile dependencies
  const technicianProfileRepository = new TechnicianProfileRepository();
  const technicianProfileService = new TechnicianProfileService(
    technicianRepository,
    technicianProfileRepository,
    userRepository,
    userAddressRepository
  );
  const technicianProfileController = new TechnicianProfileController(
    technicianProfileService
  );

  // Category Management dependencies
  const categoryManagementRepository = new CategoryRepository();
  const categoryManagementService = new CategoryService(
    categoryManagementRepository
  );
  const categoryManagementController = new CategoryController(
    categoryManagementService
  );

  // Service Management dependecies
  const serviceMangementRepository = new ServiceRepository();
  const serviceManagementService = new ServiceService(serviceMangementRepository);
  const serviceManagementController = new ServiceController(
    serviceManagementService
  );

  // Item Management Dependencies
  const itemManagementRepository = new ItemRepository();
  const itemManagementService = new ItemService(itemManagementRepository);
  const itemManagementController = new ItemController(itemManagementService);

  // User Profile
  const addressRepository = new AddressRepository();
  const addressService = new AddressService(addressRepository)
  const addressController = new AddressController(addressService)
  const userProfileService = new UserProfileService(userManagementRepository, addressRepository);
  const userProfileController = new UserProfileController(userProfileService);

  // User Location - FIXED: Create instance properly
  const userLocationRepository = new UserLocationRepository
  const userLocationService = new UserLocationService(userLocationRepository); // This should work now
  const userLocationController = new UserLocationController(userLocationService);

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
  };