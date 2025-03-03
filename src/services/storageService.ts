import fs from 'fs';
import path from 'path';

export class StorageService<T> {
    private filePath: string;

    constructor(fileName: string) {
        this.filePath = path.join(__dirname, '../../src/storage', fileName);
        this.ensureFileExists();
    }

    private ensureFileExists(): void {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '[]', 'utf8');
        }
    }

    readData(): T[] {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error: any) {
            console.error(`Error reading from ${this.filePath}:`, error.message);
            return [];
        }
    }

    writeData(data: T[]): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error: any) {
            console.error(`Error writing to ${this.filePath}:`, error.message);
            throw new Error(`Failed to write data to storage: ${error.message}`);
        }
    }

    appendData(item: T): void {
        const data = this.readData();
        data.push(item);
        this.writeData(data);
    }

    updateData(predicate: (item: T) => boolean, newData: T): void {
        const data = this.readData();
        const index = data.findIndex(predicate);
        if (index !== -1) {
            data[index] = newData;
            this.writeData(data);
        }
    }

    deleteData(predicate: (item: T) => boolean): void {
        const data = this.readData();
        const filteredData = data.filter(item => !predicate(item));
        this.writeData(filteredData);
    }

    findOne(predicate: (item: T) => boolean): T | null {
        const data = this.readData();
        return data.find(predicate) || null;
    }

    findMany(predicate: (item: T) => boolean): T[] {
        const data = this.readData();
        return data.filter(predicate);
    }
} 