import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const REQUIRED_FILES = [
    'topics.json',
    'topic-versions.json'
];

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('Created storage directory:', STORAGE_DIR);
}

// Initialize required files
for (const fileName of REQUIRED_FILES) {
    const filePath = path.join(STORAGE_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]', 'utf8');
        console.log('Created empty file:', filePath);
    }
}

console.log('Storage initialization complete.'); 