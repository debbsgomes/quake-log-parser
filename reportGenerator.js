import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseLogFile } from './parser/logParser.js';
import { generateTextReport } from './reportTypes/textReport.js';
import { generateCSVReport } from './reportTypes/csvReport.js';
import { generateJSONReport } from './reportTypes/jsonReport.js';
import { validateMatchData } from './validator/matchValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateReport(matches) {
    try {
        matches.forEach(validateMatchData);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFilename = `game_report_${timestamp}`;

        const textFilePath = path.resolve(__dirname, `${baseFilename}.txt`);
        const textReport = generateTextReport(matches);
        fs.writeFileSync(textFilePath, textReport);
        console.log(`Text report:\n${textReport}`);

        const csvFilePath = path.resolve(__dirname, `${baseFilename}.csv`);
        const csvReport = generateCSVReport(matches);
        fs.writeFileSync(csvFilePath, csvReport);
        console.log(`CSV report:\n${csvReport}`);

        const jsonFilePath = path.resolve(__dirname, `${baseFilename}.json`);
        const jsonReport = generateJSONReport(matches);
        fs.writeFileSync(jsonFilePath, jsonReport);
        console.log(`JSON report:\n${jsonReport}`);
    } catch (error) {
        throw new Error(`Error generating reports: ${error.message}`);
    }
}

const matches = parseLogFile('./qgames.log');
generateReport(matches);

