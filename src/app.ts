import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import topicRoutes from './routes/topicRoutes';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/knowledge-base/topics', topicRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({ status: 'OK', message: 'Service is running' });
});

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

export default app;
