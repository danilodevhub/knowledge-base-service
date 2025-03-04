import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { userService } from './services/userService';

// Import routes
import topicRoutes from './routes/topicRoutes';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication endpoint
app.post('/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  
  // In a real application, you would verify the password
  // For this example, we'll just check if the user exists
  const user = userService.getUserByEmail(email);
  
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  
  // In a real application, you would generate a JWT token
  // For this example, we'll just return the user ID as the token
  res.status(200).json({
    message: 'Login successful',
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

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
