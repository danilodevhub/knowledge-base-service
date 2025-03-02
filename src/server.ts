import app from './app';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Function to find an available port
const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Start the server
const startServer = async (): Promise<void> => {
  try {
    const availablePort = await findAvailablePort(Number(PORT));
    
    app.listen(availablePort, () => {
      console.log(`Server is running on port ${availablePort}`);
      console.log(`Health check available at http://localhost:${availablePort}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
