"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
class DashboardService {
    constructor(dashboardRepository, logger) {
        this._dashboardRepository = dashboardRepository;
        this._logger = logger;
    }
    async getDashboardOverview() {
        const context = { operation: 'getDashboardOverview' };
        try {
            this._logger.info('Fetching dashboard overview', context);
            const [totalRevenue, totalBookings, totalUsers, totalTechnicians, revenueGrowth, bookingsGrowth, usersGrowth, techniciansGrowth, averageOrderValueGrowth,] = await Promise.all([
                this._dashboardRepository.getTotalRevenue(),
                this._dashboardRepository.getTotalBookings(),
                this._dashboardRepository.getTotalUsers(),
                this._dashboardRepository.getTotalTechnicians(),
                this._dashboardRepository.getRevenueGrowth(),
                this._dashboardRepository.getBookingsGrowth(),
                this._dashboardRepository.getUsersGrowth(),
                this._dashboardRepository.getTechniciansGrowth(),
                this._dashboardRepository.getAverageOrderValueGrowth(),
            ]);
            const overview = {
                totalRevenue,
                totalBookings,
                totalUsers,
                totalTechnicians,
                growthMetrics: {
                    revenueGrowth,
                    bookingsGrowth,
                    usersGrowth,
                    techniciansGrowth,
                    averageOrderValueGrowth,
                },
            };
            this._logger.info('Dashboard overview fetched successfully', {
                ...context,
                data: overview,
            });
            return overview;
        }
        catch (error) {
            this._logger.error('Failed to fetch dashboard overview', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getRevenueTrend(period = 'monthly') {
        const context = { operation: 'getRevenueTrend', period };
        try {
            this._logger.info('Fetching revenue trend', context);
            const trendData = await this._dashboardRepository.getRevenueTrend(period);
            this._logger.info('Revenue trend fetched successfully', {
                ...context,
                dataPoints: trendData.length,
            });
            return trendData;
        }
        catch (error) {
            this._logger.error('Failed to fetch revenue trend', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getTopTechnicians(limit = 5) {
        const context = { operation: 'getTopTechnicians', limit };
        try {
            this._logger.info('Fetching top technicians', context);
            const technicians = await this._dashboardRepository.getTopTechnicians(limit);
            this._logger.info('Top technicians fetched successfully', {
                ...context,
                count: technicians.length,
            });
            return technicians;
        }
        catch (error) {
            this._logger.error('Failed to fetch top technicians', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getCustomerSatisfaction() {
        const context = { operation: 'getCustomerSatisfaction' };
        try {
            this._logger.info('Fetching customer satisfaction data', context);
            let satisfactionData;
            // Try to get detailed satisfaction data first
            if (this._dashboardRepository.getDetailedCustomerSatisfaction) {
                this._logger.debug('Using detailed customer satisfaction method');
                const metrics = await this._dashboardRepository.getDetailedCustomerSatisfaction();
                satisfactionData = metrics.ratingDistribution;
                this._logger.debug('Detailed satisfaction metrics', {
                    averageRating: metrics.averageRating,
                    totalReviews: metrics.totalReviews,
                });
            }
            else {
                this._logger.debug('Using basic customer satisfaction method');
                satisfactionData =
                    await this._dashboardRepository.getCustomerSatisfaction();
            }
            this._logger.info('Customer satisfaction data fetched successfully', {
                ...context,
                ratingsCount: satisfactionData.length,
                totalReviews: satisfactionData.reduce((sum, item) => sum + item.count, 0),
            });
            return satisfactionData;
        }
        catch (error) {
            this._logger.error('Failed to fetch customer satisfaction data', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getPaymentMethods() {
        const context = { operation: 'getPaymentMethods' };
        try {
            this._logger.info('Fetching payment methods data', context);
            let paymentMethods;
            // Use the enhanced method with percentages if available
            if (this._dashboardRepository.getPaymentMethodsWithPercentages) {
                paymentMethods = await this._dashboardRepository.getPaymentMethodsWithPercentages();
            }
            else {
                const basicMethods = await this._dashboardRepository.getPaymentMethods();
                // Calculate percentages manually
                const totalAmount = basicMethods.reduce((sum, method) => sum + method.amount, 0);
                paymentMethods = basicMethods.map(method => ({
                    ...method,
                    percentage: totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0,
                }));
            }
            this._logger.info('Payment methods data fetched successfully', {
                ...context,
                methodsCount: paymentMethods.length,
                methods: paymentMethods.map(pm => `${pm.method}: ${pm.amount} (${pm.percentage.toFixed(1)}%)`),
            });
            return paymentMethods;
        }
        catch (error) {
            this._logger.error('Failed to fetch payment methods data', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getGrowthMetrics() {
        const context = { operation: 'getGrowthMetrics' };
        try {
            this._logger.info('Fetching growth metrics', context);
            const overview = await this.getDashboardOverview();
            const growthMetrics = [
                {
                    name: 'Revenue',
                    growth: overview.growthMetrics.revenueGrowth,
                },
                {
                    name: 'Bookings',
                    growth: overview.growthMetrics.bookingsGrowth,
                },
                {
                    name: 'New Users',
                    growth: overview.growthMetrics.usersGrowth,
                },
                {
                    name: 'New Technicians',
                    growth: overview.growthMetrics.techniciansGrowth,
                },
                {
                    name: 'Average order value',
                    growth: overview.growthMetrics.averageOrderValueGrowth,
                },
            ];
            this._logger.info('Growth metrics fetched successfully', {
                ...context,
                metricsCount: growthMetrics.length,
            });
            return growthMetrics;
        }
        catch (error) {
            this._logger.error('Failed to fetch growth metrics', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getCompleteDashboard() {
        const context = { operation: 'getCompleteDashboard' };
        try {
            this._logger.info('Fetching complete dashboard data', context);
            const [overview, revenueTrend, topTechnicians, customerSatisfaction, paymentMethods, growthMetrics,] = await Promise.all([
                this.getDashboardOverview(),
                this.getRevenueTrend(),
                this.getTopTechnicians(),
                this.getCustomerSatisfaction(),
                this.getPaymentMethods(),
                this.getGrowthMetrics(),
            ]);
            const dashboardData = {
                overview,
                revenueTrend,
                topTechnicians,
                customerSatisfaction,
                paymentMethods,
                growthMetrics,
            };
            this._logger.info('Complete dashboard data fetched successfully', {
                ...context,
                data: dashboardData,
            });
            return dashboardData;
        }
        catch (error) {
            this._logger.error('Failed to fetch complete dashboard data', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
}
exports.DashboardService = DashboardService;
