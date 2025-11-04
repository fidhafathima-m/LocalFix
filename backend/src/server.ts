import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan"
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import { stream } from './utils/logger';
import { requestLogger } from "./middleware/requestLoger";
import { errorHandler } from "./middleware/errorHandler";

import userAuth from "./routes/userRoutes";
import userRoutes from "./routes/admin/userManagementRoutes";
import adminTechnicianRoutes from "./routes/admin/technicianManagementRoutes";
import technicianRoutes from "./routes/technician/technicianRoutes";
import technicianDashboardRoutes from "./routes/technician/technicianDashboardRoutes";
import technicianProfileRoutes from "./routes/technician/technicianProfileRoutes";
import categoryManagementRoutes from "./routes/admin/categoryManagementRoutes";
import serviceMangementRoutes from "./routes/admin/serviceManagementRoutes";
import itemManagementRoutes from "./routes/admin/itemManagementRoutes";
import pubicUserRoutes from "./routes/publicUserRoutes";
import userProfileRoutes from "./routes/user/userProfileRoutes"
import bookingRoutes from "./routes/user/bookingRoutes";
import paymentRoutes from "./routes/user/paymentRoutes";

connectDB();

const app: Application = express();

app.use(morgan('combined', { stream }));

app.use(requestLogger);


app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

// authentication routes
app.use("/api/auth", userAuth);

// admin routes
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/technicians", adminTechnicianRoutes);
app.use("/api/admin/categories", categoryManagementRoutes);
app.use("/api/admin/services", serviceMangementRoutes);
app.use("/api/admin/items", itemManagementRoutes);

// technciian routes
app.use("/api/technician-application", technicianRoutes);
app.use("/api/technician/profile", technicianProfileRoutes);
app.use("/api/technician", technicianDashboardRoutes);

app.use("/api/public/user", pubicUserRoutes);

app.use("/api/user", userProfileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("Localfix API running...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
