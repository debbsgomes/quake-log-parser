import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseLogFile } from './parser/logParser.js';
import { generateTextReport } from './reportTypes/textReport.js';
import { generateCSVReport } from './reportTypes/csvReport.js';
import { generateJSONReport } from './reportTypes/jsonReport.js';
import { validateMatchData } from './validator/matchValidator.js';
import { getLLMResponse } from './llm/llmClient.js';
import { analyzeMatchData } from './llm/llmClient.js';

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

async function analyzeGameData() {
    try {
        const matches = parseLogFile('./qgames.log');
        const analysis = analyzeMatchData(matches);

        const combinedPrompt = `
            How many matches were played? ${analysis.totalMatches}.
            How many unique players participated? ${analysis.uniquePlayers}.
            Who is the player with the highest score? ${analysis.highestScorePlayer}.
        `;

        const response = await getLLMResponse(combinedPrompt);
        console.log('Analysis Results:', response);
        
    } catch (error) {
        console.error('Error analyzing game data:', error);
        if (error.response && error.response.data.error.code === 'insufficient_quota') {
            console.error('Quota exceeded. Please check your billing and plan details.');
        }
    }
}


const matches = parseLogFile('./qgames.log');
generateReport(matches);
analyzeGameData(matches);

