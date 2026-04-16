import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import userRoutes from './routes/userroutes.js';
import productRoutes from './routes/productroutes.js';
import customerRoutes from './routes/customerroutes.js';
import supplierRoutes from './routes/supplierroutes.js';
import salesOrderRoutes from './routes/salesorderroutes.js';
import purchaseOrderRoutes from './routes/purchaseorderroutes.js';
import grnRoutes from './routes/grnroutes.js';
import invoiceRoutes from './routes/invoiceroutes.js';
import dashboardRoutes from './routes/dashboardroutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//Error Middleware
app.use(errorMiddleware);

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/salesorders', salesOrderRoutes);
app.use('/api/purchaseorders', purchaseOrderRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

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