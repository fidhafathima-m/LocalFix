import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors'
import connectDB from './config/db'
import userAuth from './modules/user/user.routes'
import userRoutes from './modules/admin/admin.routes'
import adminTechnicianRoutes from './modules/admin/admin.technicianRoutes'
import technicianRoutes from './modules/technician/technician.routes'

connectDB();

const app: Application = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(cors({ 
  origin: "http://localhost:5173", 
  methods: ["GET","POST","OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type","Authorization"], 
  credentials: true 
}));

app.use("/uploads", express.static("uploads"));

app.use('/api/auth', userAuth);
app.use("/api/users", userRoutes);

// Mount routes
app.use("/api/technicians", adminTechnicianRoutes);
app.use('/api/technician-application', technicianRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send("Localfix API running...")
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));