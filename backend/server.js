import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import userRoutes from './routes/userroutes.js';
import productRoutes from './routes/productroutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

//Server 
const PORT = process.env.PORT || 5000;

connectDB();



app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

//SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});