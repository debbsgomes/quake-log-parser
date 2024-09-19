import fs from 'fs';

export function readLogFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
}
