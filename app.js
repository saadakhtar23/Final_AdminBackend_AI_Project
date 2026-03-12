// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { config } from './config/index.js';
import assessmentRoutes from './routes/assessmentRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: ["https://final-frontend-ai-project.vercel.app","http://localhost:5173","http://20.81.204.72"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (config.nodeEnv === 'development') app.use(morgan('dev'));

// Basic rate limiter (tweak in production)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
});
app.use(limiter);

// Routes
app.use('/api', routes);


// Assessment routes
app.use('/api/assessment', assessmentRoutes);

// Notification routes
import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// central error handler
app.use(errorHandler);

export default app;
