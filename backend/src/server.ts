import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
dotenv.config();
import cors from 'cors';
import connectDB from './config/db';
import { stream } from './utils/logger';
import { requestLogger } from './middleware/requestLoger';
import { errorHandler } from './middleware/errorHandler';
import http from 'http';

// Import route creators
import userAuth from './routes/userRoutes';
import userRoutes from './routes/admin/userManagementRoutes';
import createTechnicianRoutes from './routes/admin/technicianManagementRoutes';
import technicianRoutes from './routes/technician/technicianRoutes';
import technicianDashboardRoutes from './routes/technician/technicianDashboardRoutes';
import createTechnicianProfileRoutes from './routes/technician/technicianProfileRoutes';
import categoryManagementRoutes from './routes/admin/categoryManagementRoutes';
import serviceMangementRoutes from './routes/admin/serviceManagementRoutes';
import itemManagementRoutes from './routes/admin/itemManagementRoutes';
import orderManagementRoutes from './routes/admin/orderManagementRoutes';
import reviewManagementRoutes from './routes/admin/reviewManagemnetRoutes';
import dashboardRoutes from './routes/admin/dashboardRoutes';
import pubicUserRoutes from './routes/publicUserRoutes';
import createUserProfileRoutes from './routes/user/userProfileRoutes';
import createBookingRoutes from './routes/user/bookingRoutes';
import createTechnicianOrderRoutes from './routes/technician/technicianOrderRoutes';
import createPaymentManagementRoutes from './routes/admin/paymentManagementRoutes';
import paymentRoutes from './routes/user/paymentRoutes';
import createOrderRoutes from './routes/user/orderRoutes';
import notificationRoutes from './routes/notificationRoutes';
import subscriptionRoutes from './routes/admin/subscriptionManagementRoutes';
import technicianSubscriptionRoutes from './routes/technician/subscriptionRoutes';
import serviceRoutes from './routes/user/serviceRoutes';
import chatRoutes from './routes/user/chatRoutes';
import technicianChatRoutes from './routes/technician/technicianChatRoutes';
import messageRoutes from './routes/user/messageRoutes';

// Import container functions
import {
  createSocketDependentServices,
  userProfileController,
  addressController,
  userLocationController,
} from './config/container';
import createSparePartsRequestRoutes from './routes/technician/sparePartsRoutes';

connectDB();

const app: Application = express();
const server = http.createServer(app);

const {
  socketService,
  technicianManagementController,
  orderController,
  reviewController,
  technicianOrderController,
  bookingController,
  technicianProfileController,
  paymentManagementController,
  sparePartsRequestController,
} = createSocketDependentServices(server);

const adminTechnicianRoutes = createTechnicianRoutes(
  technicianManagementController
);
const technicianProfileRoutes = createTechnicianProfileRoutes(
  technicianProfileController
);
const technicianOrderRoutes = createTechnicianOrderRoutes(
  technicianOrderController
);
const paymentManagementRoutes = createPaymentManagementRoutes(
  paymentManagementController
);
const bookingRoutes = createBookingRoutes(bookingController);
const orderRoutes = createOrderRoutes(orderController);
const userProfileRoutes = createUserProfileRoutes(
  userLocationController,
  userProfileController,
  addressController,
  reviewController
);
const sparePartsRequestRoutes = createSparePartsRequestRoutes(
  sparePartsRequestController
);

app.use(morgan('combined', { stream }));
app.use(requestLogger);

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', userAuth);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/technicians', adminTechnicianRoutes);
app.use('/api/admin/categories', categoryManagementRoutes);
app.use('/api/admin/services', serviceMangementRoutes);
app.use('/api/admin/items', itemManagementRoutes);
app.use('/api/admin/orders', orderManagementRoutes);
app.use('/api/admin/reviews', reviewManagementRoutes);
app.use('/api/admin/payments', paymentManagementRoutes);
app.use('/api/admin/reports', dashboardRoutes);
app.use('/api/admin/subscriptions', subscriptionRoutes);
app.use('/api/technician-application', technicianRoutes);
app.use('/api/technician/profile', technicianProfileRoutes);
app.use('/api/technician/orders', technicianOrderRoutes);
app.use('/api/technician/spare-parts', sparePartsRequestRoutes);
app.use('/api/technician/subscriptions', technicianSubscriptionRoutes);
app.use('/api/technician/chat', technicianChatRoutes);
app.use('/api/technician', technicianDashboardRoutes);
app.use('/api/public/user', pubicUserRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Localfix API running...');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running on port ${PORT}`);
});
