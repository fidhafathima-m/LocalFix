import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db";
import userAuth from "./routes/userRoutes";
import userRoutes from "./routes/admin/userManagementRoutes";
import adminTechnicianRoutes from "./routes/admin/technicianManagementRoutes";
import technicianRoutes from "./routes/technician/technicianRoutes";
import technicianDashboardRoutes from "./routes/technician/technicianDashboardRoutes";
import technicianProfileRoutes from "./routes/technician/technicianProfileRoutes";

connectDB();

const app: Application = express();

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

// technciian routes
app.use("/api/technician-application", technicianRoutes);
app.use("/api/technician", technicianDashboardRoutes);

console.log('🔧 Main App: Registering technician profile routes');
app.use("/api/technician/profile", technicianProfileRoutes);
console.log('🔧 Main App: Technician profile routes registered at /api/technician/profile');

app.get("/", (req: Request, res: Response) => {
  res.send("Localfix API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
