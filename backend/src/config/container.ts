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

// User Management Dependencies
const userManagementRepository = new UserManagementRepository();
const userManagementService = new UserManagementService(
  userManagementRepository
);
const userManagementController = new UserManagementController(
  userManagementService
);

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
  userRepository
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

export {
  userManagementController,
  userManagementService,
  userManagementRepository,
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
};
