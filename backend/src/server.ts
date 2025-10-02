import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors'
import connectDB from './config/db'
import userAuth from './modules/user/user.routes'
import userRoutes from './modules/admin/admin.routes'
import technicianRoutes from './modules/technician/technician.routes'


connectDB();

// Debug: Check if environment variables are loaded
console.log('🔑 Environment Check:', {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING',
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'MISSING',
  jwt_secret: process.env.JWT_SECRET ? 'SET' : 'MISSING'
});

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", methods: ["GET","POST","OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type","Authorization"], credentials: true }));

app.use("/uploads", express.static("uploads"));

app.use('/api/auth', userAuth);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use('/api/technician-application', technicianRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send("Localfix API running...")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));