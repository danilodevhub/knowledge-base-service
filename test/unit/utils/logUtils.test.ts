import { LogUtils } from '../../../src/utils/logUtils';

describe('LogUtils', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('logError', () => {
    it('should log error messages with service name and operation', () => {
      const error = new Error('Test error');
      LogUtils.logError('TestService', 'testOperation', error);

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Error during testOperation:',
        'Test error',
        '',
      );
    });

    it('should include context when provided', () => {
      const error = new Error('Context error');
      const context = { id: '123', data: 'test' };
      LogUtils.logError('TestService', 'testOperation', error, context);

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Error during testOperation:',
        'Context error',
        `\nContext: ${JSON.stringify(context)}`,
      );
    });

    it('should handle errors without message property', () => {
      const error = 'String error';
      LogUtils.logError('TestService', 'testOperation', error);

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Error during testOperation:',
        'String error',
        '',
      );
    });
  });

  describe('logWarning', () => {
    it('should log warning messages with service name and operation', () => {
      LogUtils.logWarning('TestService', 'testOperation', 'Test warning');

      expect(console.warn).toHaveBeenCalledWith(
        '[TestService] Warning during testOperation:',
        'Test warning',
        '',
      );
    });

    it('should include context when provided', () => {
      const context = { id: '123', data: 'test' };
      LogUtils.logWarning('TestService', 'testOperation', 'Warning with context', context);

      expect(console.warn).toHaveBeenCalledWith(
        '[TestService] Warning during testOperation:',
        'Warning with context',
        `\nContext: ${JSON.stringify(context)}`,
      );
    });
  });

  describe('logInfo', () => {
    it('should log info messages with service name and operation', () => {
      LogUtils.logInfo('TestService', 'testOperation', 'Test info');

      expect(console.log).toHaveBeenCalledWith(
        '[TestService] Info during testOperation:',
        'Test info',
        '',
      );
    });

    it('should include context when provided', () => {
      const context = { id: '123', data: 'test' };
      LogUtils.logInfo('TestService', 'testOperation', 'Info with context', context);

      expect(console.log).toHaveBeenCalledWith(
        '[TestService] Info during testOperation:',
        'Info with context',
        `\nContext: ${JSON.stringify(context)}`,
      );
    });
  });
});
