import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

import { LogUtils } from '../utils/logUtils';

import { IDao } from './IDao';

// Load environment variables
dotenv.config();

// Storage configuration
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');

// JSON File DAO Implementation
export class JsonFileDao<T extends { id: string }> implements IDao<T> {
  private filePath: string;
  private readonly SERVICE_NAME = 'JsonFileDao';

  constructor(fileName: string) {
    // Ensure storage directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    this.filePath = path.join(STORAGE_DIR, fileName);
    this.ensureFileExists();
  }

  private ensureFileExists(): void {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '[]', 'utf8');
    }
  }

  private readData(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error: Error | unknown) {
      LogUtils.logError(this.SERVICE_NAME, 'readData', error, { filePath: this.filePath });
      return [];
    }
  }

  private writeData(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error: Error | unknown) {
      LogUtils.logError(this.SERVICE_NAME, 'writeData', error, { filePath: this.filePath });
      throw new Error(
        `Failed to write data to storage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  findAll(): T[] {
    return this.readData();
  }

  findById(id: string): T | null {
    const data = this.readData();
    const result = data.find(item => item.id === id) || null;
    LogUtils.logInfo(
      this.SERVICE_NAME,
      'findById',
      `Item ${result ? 'found' : 'not found'} with id: ${id}`,
    );
    return result;
  }

  findBy(predicate: (item: T) => boolean): T | null {
    const data = this.readData();
    return data.find(predicate) || null;
  }

  findManyBy(predicate: (item: T) => boolean): T[] {
    const data = this.readData();
    return data.filter(predicate);
  }

  create(item: T): void {
    const data = this.readData();
    data.push(item);
    this.writeData(data);
  }

  update(predicate: (item: T) => boolean, item: T): void {
    const data = this.readData();
    const index = data.findIndex(predicate);
    if (index !== -1) {
      data[index] = item;
      this.writeData(data);
    }
  }

  delete(predicate: (item: T) => boolean): void {
    const data = this.readData();
    const filteredData = data.filter(item => !predicate(item));
    this.writeData(filteredData);
  }
}

// Factory for creating DAOs
export class DaoFactory {
  static createJsonFileDao<T extends { id: string }>(fileName: string): IDao<T> {
    return new JsonFileDao<T>(fileName);
  }
}
