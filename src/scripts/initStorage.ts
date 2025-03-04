import fs from 'fs';
import path from 'path';
import { LogUtils } from '../utils/logUtils';

const SERVICE_NAME = 'InitStorage';
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const REQUIRED_FILES = [
    'topics.json',
    'topic-versions.json'
];

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    LogUtils.logInfo(SERVICE_NAME, 'initialize', `Created storage directory: ${STORAGE_DIR}`);
}

// Initialize required files
for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(STORAGE_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf8');
        LogUtils.logInfo(SERVICE_NAME, 'initialize', `Created empty file: ${filePath}`);
    }
}

LogUtils.logInfo(SERVICE_NAME, 'initialize', 'Storage initialization complete.'); 