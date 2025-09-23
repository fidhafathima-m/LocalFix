import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './src/config/db'
import userAuth from './src/routes/auth/userAuth'
import technicianAuth from './src/routes/auth/technicianAuth'
import technicianApplication from './src/routes/technician/technicianApplicationRouter'
import userRoutes from './src/routes/admin/userRoutes'

dotenv.config();
connectDB();

const app: Application = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", methods: ["GET","POST","OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type","Authorization"], credentials: true }));

app.use("/uploads", express.static("uploads"));



app.use('/api/auth', userAuth);
app.use('/api/auth/technicians', technicianAuth);
app.use("/api/technician-application", technicianApplication);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send("Localfix API running...")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));