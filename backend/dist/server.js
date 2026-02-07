"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./utils/logger");
const requestLoger_1 = require("./middleware/requestLoger");
const errorHandler_1 = require("./middleware/errorHandler");
const http_1 = __importDefault(require("http"));
// Import route creators
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const userManagementRoutes_1 = __importDefault(require("./routes/admin/userManagementRoutes"));
const technicianManagementRoutes_1 = __importDefault(require("./routes/admin/technicianManagementRoutes"));
const technicianRoutes_1 = __importDefault(require("./routes/technician/technicianRoutes"));
const technicianDashboardRoutes_1 = __importDefault(require("./routes/technician/technicianDashboardRoutes"));
const technicianProfileRoutes_1 = __importDefault(require("./routes/technician/technicianProfileRoutes"));
const categoryManagementRoutes_1 = __importDefault(require("./routes/admin/categoryManagementRoutes"));
const serviceManagementRoutes_1 = __importDefault(require("./routes/admin/serviceManagementRoutes"));
const itemManagementRoutes_1 = __importDefault(require("./routes/admin/itemManagementRoutes"));
const orderManagementRoutes_1 = __importDefault(require("./routes/admin/orderManagementRoutes"));
const reviewManagemnetRoutes_1 = __importDefault(require("./routes/admin/reviewManagemnetRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/admin/dashboardRoutes"));
const publicUserRoutes_1 = __importDefault(require("./routes/publicUserRoutes"));
const userProfileRoutes_1 = __importDefault(require("./routes/user/userProfileRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/user/bookingRoutes"));
const technicianOrderRoutes_1 = __importDefault(require("./routes/technician/technicianOrderRoutes"));
const paymentManagementRoutes_1 = __importDefault(require("./routes/admin/paymentManagementRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/user/paymentRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/user/orderRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const subscriptionManagementRoutes_1 = __importDefault(require("./routes/admin/subscriptionManagementRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/technician/subscriptionRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/user/serviceRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/user/chatRoutes"));
const technicianChatRoutes_1 = __importDefault(require("./routes/technician/technicianChatRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/user/messageRoutes"));
// Import container functions
const container_1 = require("./config/container");
const sparePartsRoutes_1 = __importDefault(require("./routes/technician/sparePartsRoutes"));
(0, db_1.default)();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const { socketService, technicianManagementController, orderController, reviewController, technicianOrderController, bookingController, technicianProfileController, paymentManagementController, sparePartsRequestController, } = (0, container_1.createSocketDependentServices)(server);
const adminTechnicianRoutes = (0, technicianManagementRoutes_1.default)(technicianManagementController);
const technicianProfileRoutes = (0, technicianProfileRoutes_1.default)(technicianProfileController);
const technicianOrderRoutes = (0, technicianOrderRoutes_1.default)(technicianOrderController);
const paymentManagementRoutes = (0, paymentManagementRoutes_1.default)(paymentManagementController);
const bookingRoutes = (0, bookingRoutes_1.default)(bookingController);
const orderRoutes = (0, orderRoutes_1.default)(orderController);
const userProfileRoutes = (0, userProfileRoutes_1.default)(container_1.userLocationController, container_1.userProfileController, container_1.addressController, reviewController);
const sparePartsRequestRoutes = (0, sparePartsRoutes_1.default)(sparePartsRequestController);
app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
app.use(requestLoger_1.requestLogger);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'https://localfix.store',
        'https://www.localfix.store',
        'https://localfix.store',
        'https://www.localfix.store',
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Idempotency-Key',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Idempotency-Key'],
    credentials: true,
}));
app.use('/uploads', express_1.default.static('uploads'));
app.use('/api/auth', userRoutes_1.default);
app.use('/api/admin/users', userManagementRoutes_1.default);
app.use('/api/admin/technicians', adminTechnicianRoutes);
app.use('/api/admin/categories', categoryManagementRoutes_1.default);
app.use('/api/admin/services', serviceManagementRoutes_1.default);
app.use('/api/admin/items', itemManagementRoutes_1.default);
app.use('/api/admin/orders', orderManagementRoutes_1.default);
app.use('/api/admin/reviews', reviewManagemnetRoutes_1.default);
app.use('/api/admin/payments', paymentManagementRoutes);
app.use('/api/admin/reports', dashboardRoutes_1.default);
app.use('/api/admin/subscriptions', subscriptionManagementRoutes_1.default);
app.use('/api/technician-application', technicianRoutes_1.default);
app.use('/api/technician/profile', technicianProfileRoutes);
app.use('/api/technician/orders', technicianOrderRoutes);
app.use('/api/technician/spare-parts', sparePartsRequestRoutes);
app.use('/api/technician/subscriptions', subscriptionRoutes_1.default);
app.use('/api/technician/chat', technicianChatRoutes_1.default);
app.use('/api/technician', technicianDashboardRoutes_1.default);
app.use('/api/public/user', publicUserRoutes_1.default);
app.use('/api/user', userProfileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Localfix API running...');
});
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server running on port ${PORT}`);
});
