import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import connectDB from './src/config/db'
import authRoutes from './src/routes/user/authRoutes'

dotenv.config();
connectDB();

const app: Application = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send("Localfix API running...")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));