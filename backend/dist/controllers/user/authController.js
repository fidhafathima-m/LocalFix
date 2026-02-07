"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class AuthController {
    constructor(authService, logger) {
        this.signup = async (req, res) => {
            const signupData = req.body;
            const context = {
                operation: 'signup',
                userType: signupData.userType,
                email: signupData.email,
                phone: signupData.phone,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Signup request received', context);
                const result = await this._authService.signup(signupData);
                this._logger.info('Signup completed successfully', {
                    ...context,
                    userId: result.data?.user?._id,
                    success: result.success,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Signup controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.verifyOtp = async (req, res) => {
            const otpData = req.body;
            const context = {
                operation: 'verifyOtp',
                email: otpData.email,
                phone: otpData.phone,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('OTP verification request received', context);
                const result = await this._authService.verifyOtp(otpData);
                this._logger.info('OTP verification completed', {
                    ...context,
                    success: result.success,
                    verified: result.data?.verified,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Verify OTP controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.verifyResetOtp = async (req, res) => {
            const otpData = req.body;
            const context = {
                operation: 'verifyResetOtp',
                email: otpData.email,
                phone: otpData.phone,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Reset OTP verification request received', context);
                const result = await this._authService.verifyResetOtp(otpData);
                this._logger.info('Reset OTP verification completed', {
                    ...context,
                    success: result.success,
                    verified: result.data?.verified,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Verify reset OTP controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.login = async (req, res) => {
            const credentials = req.body;
            const context = {
                operation: 'login',
                emailPhone: credentials?.identifier,
                userType: credentials?.role,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Login request received', context);
                const result = await this._authService.login(credentials);
                this._logger.info('Login completed', {
                    ...context,
                    success: result.success,
                    userId: result.data?.user?._id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Login controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.forgotPassword = async (req, res) => {
            const { phone, email, userType } = req.body;
            const context = {
                operation: 'forgotPassword',
                email,
                phone,
                userType,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Forgot password request received', context);
                const result = await this._authService.forgotPassword(phone, email, userType);
                this._logger.info('Forgot password request processed', {
                    ...context,
                    success: result.success,
                    otpSent: result.data?.otpSent,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Forgot password controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.resetPassword = async (req, res) => {
            const resetData = req.body;
            const context = {
                operation: 'resetPassword',
                email: resetData.email,
                phone: resetData.phone,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Reset password request received', context);
                const result = await this._authService.resetPassword(resetData);
                this._logger.info('Password reset completed', {
                    ...context,
                    success: result.success,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Reset password controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.resendOTP = async (req, res) => {
            const { phone, email, purpose, userType } = req.body;
            const context = {
                operation: 'resendOTP',
                email,
                phone,
                purpose,
                userType,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Resend OTP request received', context);
                const result = await this._authService.resendOTP(phone, email, purpose, userType);
                this._logger.info('OTP resent successfully', {
                    ...context,
                    success: result.success,
                    otpSent: result.data?.otpSent,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Resend OTP controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.googleAuth = async (req, res) => {
            const googleData = req.body;
            const context = {
                operation: 'googleAuth',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Google authentication request received', context);
                const result = await this._authService.googleAuth(googleData);
                this._logger.info('Google authentication completed', {
                    ...context,
                    success: result.success,
                    userId: result.data?.user?._id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Google auth controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.facebookLogin = async (req, res) => {
            const { accessToken, userID } = req.body;
            const context = {
                operation: 'facebookLogin',
                facebookUserId: userID,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Facebook login request received', context);
                const result = await this._authService.facebookLogin(accessToken, userID);
                this._logger.info('Facebook login completed', {
                    ...context,
                    success: result.success,
                    userId: result.data?.user?._id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Facebook login controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.refreshToken = async (req, res) => {
            const { refreshToken } = req.body;
            const context = {
                operation: 'refreshToken',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Refresh token request received', context);
                const result = await this._authService.refreshToken(refreshToken);
                this._logger.info('Token refresh completed', {
                    ...context,
                    success: result.success,
                    tokensRefreshed: !!result.data?.tokens,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Refresh token controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.logout = async (req, res) => {
            const { refreshToken } = req.body;
            const userId = req.user?.id;
            const context = {
                operation: 'logout',
                userId,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Logout request received', context);
                if (!userId) {
                    this._logger.warn('Logout failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._authService.logout(userId, refreshToken);
                this._logger.info('Logout completed successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Logout controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._authService = authService;
        this._logger = logger;
    }
}
exports.AuthController = AuthController;
