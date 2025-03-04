import http from 'http';

import dotenv from 'dotenv';

import app from './app';
import { LogUtils } from './utils/logUtils';

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
  const SERVICE_NAME = 'Knowledge Base Service';
  try {
    const availablePort = await findAvailablePort(Number(PORT));
    
    app.listen(availablePort, () => {
      LogUtils.logInfo(SERVICE_NAME, 'startServer', `Server is running on port ${availablePort}`);
      LogUtils.logInfo(SERVICE_NAME, 'startServer', `Health check available at http://localhost:${availablePort}/health`);
    });
  } catch (error) {
    LogUtils.logError(SERVICE_NAME, 'startServer', error);
    process.exit(1);
  }
};

startServer();
