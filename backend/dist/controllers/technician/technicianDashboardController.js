"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianDashboardController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class TechnicianDashboardController {
    constructor(dashboardService, logger) {
        this.getDashboardOverview = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getDashboardOverview',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetchning dashboard overview', context);
                if (!technicianId) {
                    this._logger.warn('Authemtication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._dashboardService.getDashboardOverview(technicianId);
                this._logger.info('Dashboard retrieved successfully', {
                    ...context,
                    overview: result?.overview,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                console.error('Get dashboard overview controller error:', error);
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                this._logger.error('Get technician dashboard error', {
                    ...context,
                    error: error,
                });
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianProfile = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getTechnicianProfile',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetchning technician profile', context);
                if (!technicianId) {
                    this._logger.warn('Authemtication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._dashboardService.getTechnicianProfile(technicianId);
                this._logger.info('Technician profile retrieved successfully', {
                    ...context,
                    profile: result?.profile,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                console.error('Get technician profile controller error:', error);
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                this._logger.error('Get technician profile error', {
                    ...context,
                    error: error,
                });
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._dashboardService = dashboardService;
        this._logger = logger;
    }
}
exports.TechnicianDashboardController = TechnicianDashboardController;
