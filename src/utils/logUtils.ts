/**
 * Utility class for logging functionality across the application
 */
export class LogUtils {
  /**
   * Log an error with context information
   * @param service The service or component where the error occurred
   * @param operation The operation that was being performed
   * @param error The error object
   * @param context Optional additional context
   */
  static logError(service: string, operation: string, error: any, context?: any): void {
    console.error(
      `[${service}] Error during ${operation}:`, 
      error.message || error, 
      context ? `\nContext: ${JSON.stringify(context)}` : ''
    );
  }

  /**
   * Log a warning with context information
   * @param service The service or component where the warning occurred
   * @param operation The operation that was being performed
   * @param message Warning message
   * @param context Optional additional context
   */
  static logWarning(service: string, operation: string, message: string, context?: any): void {
    console.warn(
      `[${service}] Warning during ${operation}:`, 
      message, 
      context ? `\nContext: ${JSON.stringify(context)}` : ''
    );
  }

  /**
   * Log info with context information
   * @param service The service or component where the info is logged
   * @param operation The operation that was being performed
   * @param message Info message
   * @param context Optional additional context
   */
  static logInfo(service: string, operation: string, message: string, context?: any): void {
    console.log(
      `[${service}] Info during ${operation}:`, 
      message, 
      context ? `\nContext: ${JSON.stringify(context)}` : ''
    );
  }
} 