const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 1. Load Environment Variables
dotenv.config(); 

// 2. Connect to Database
connectDB();

// 3. Import Routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

const app = express();

// 4. Middleware Configuration
// Allow the deployed frontend + local dev to call the API with credentials (cookies)
const allowedOrigins = [
  'https://sportizzz.vercel.app',
  'https://sportizzz-git-main-jahanzaib-khans-projects-aed33117.vercel.app',
  'https://sportizzz-imix976et-jahanzaib-khans-projects-aed33117.vercel.app',
  'http://localhost:5173',
];

const isAllowedDynamic = (origin = '') => {
  // Allow Vercel preview deployments for this project
  if (origin.endsWith('.vercel.app') && origin.includes('sportizzz')) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server / curl
      if (allowedOrigins.includes(origin) || isAllowedDynamic(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ✅ FIXED: Added limit to handle large product data (images/colors)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

// 5. API Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);

// 6. Static Folder
const __dirname__ = path.resolve();
app.use('/uploads', express.static(path.join(__dirname__, '/uploads')));

// 7. Error Handling Middleware (Must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});