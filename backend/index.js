import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import contactRouter from './routers/contactRouter.js';
import adminRouter from './routers/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
