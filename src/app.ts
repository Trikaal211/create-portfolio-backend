import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swagger';
import rootRouter from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/appError';

const app = express();

// 1) Configure Global Security & Utility Middlewares
// Apply Helmet security headers, disabling CSP specifically for Swagger API docs readability
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Apply Logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Enable Cross-Origin Resource Sharing with production controls
const allowedOrigins = [
  'https://kiwi-click.netlify.app',
  'https://www.kiwi-click.netlify.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse incoming payloads to JSON (with body limits)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Swagger UI documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// System Health-check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'KiwiClicks backend is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// 2) Bind API Gateway Router
app.use('/api', rootRouter);

// Handle unknown route attempts
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3) Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;
export { app };
