import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateMatchData(match) {
    if (!match || typeof match !== 'object') {
        throw new Error('Invalid match data: Match is missing or not an object.');
    }
    if (typeof match.totalKills !== 'number') {
        throw new Error('Invalid match data: totalKills should be a number.');
    }
    if (!(match.players instanceof Set)) {
        throw new Error('Invalid match data: players should be a Set.');
    }
    if (typeof match.kills !== 'object') {
        throw new Error('Invalid match data: kills should be an object.');
    }
}

function parseLogFile(filePath) {
    let logData;
    try {
        logData = fs.readFileSync(filePath, 'utf-8');
        console.log('Log Data Read:', logData);
    } catch (error) {
        logger.error(`Error reading file ${filePath}: ${error.message}`);
        return [];
    }

    const lines = logData.split('\n');
    console.log('Number of lines:', lines.length);
    const matches = [];
    let currentMatch = null;

    lines.forEach((line, index) => {
        console.log(`Processing Line ${index}:`, line);
        try {
            if (line.includes('InitGame')) {
                console.log('Found InitGame');
                if (currentMatch && currentMatch.totalKills > 0) {
                    matches.push(currentMatch);
                    console.log('Pushed current match:', currentMatch);
                }
                currentMatch = { totalKills: 0, players: new Set(), kills: {} };
            } else if (line.includes('ShutdownGame')) {
                console.log('Found ShutdownGame');
                if (currentMatch && currentMatch.totalKills > 0) {
                    matches.push(currentMatch);
                    console.log('Pushed current match:', currentMatch);
                    currentMatch = null;
                }
            } else if (line.includes('Kill:')) {
                console.log('Found Kill line');
                const killData = parseKillLine(line);

                if (killData && currentMatch) {
                    console.log('Kill data parsed:', killData);
                    currentMatch.totalKills += 1;
                    currentMatch.players.add(killData.killer);
                    currentMatch.players.add(killData.victim);

                    if (killData.killer !== '<world>') {
                        currentMatch.kills[killData.killer] = (currentMatch.kills[killData.killer] || 0) + 1;
                    }
                    console.log('Updated current match:', currentMatch);
                }
            }
        } catch (error) {
            logger.error(`Error processing line "${line}": ${error.message}`);
        }
    });

    if (currentMatch && currentMatch.totalKills > 0) {
        matches.push(currentMatch);
        console.log('Pushed final match:', currentMatch);
    }

    console.log('Final matches:', matches);
    return matches;
}


function parseKillLine(line) {
    const killRegex = /Kill:\s+\d+\s+\d+\s+\d+:\s+(.*?)\skilled\s(.*?)\sby\s(.*)$/;
    const match = line.match(killRegex);
    if (match) {
        const [, killer, victim, meansOfDeath] = match;
        return { 
            killer: killer === '<world>' ? '<world>' : killer.trim(), 
            victim: victim.trim(), 
            meansOfDeath: meansOfDeath.trim() 
        };
    }
    return null;
}

function generateReport(matches) {
    try {

        matches.forEach(validateMatchData);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFilename = `game_report_${timestamp}`;

        const textFilePath = path.resolve(__dirname, `${baseFilename}.txt`);
        const textReport = generateTextReport(matches);
        fs.writeFileSync(textFilePath, textReport);
        console.log(`Text report saved to ${textFilePath}`);

        const csvFilePath = path.resolve(__dirname, `${baseFilename}.csv`);
        const csvReport = generateCSVReport(matches);
        fs.writeFileSync(csvFilePath, csvReport);
        console.log(`CSV report saved to ${csvFilePath}`);

        const jsonFilePath = path.resolve(__dirname, `${baseFilename}.json`);
        const jsonReport = generateJSONReport(matches);
        fs.writeFileSync(jsonFilePath, jsonReport);
        console.log(`JSON report saved to ${jsonFilePath}`);
    } catch (error) {
        logger.error(`Error generating reports: ${error.message}`);
        console.error(`Full error: ${error.stack}`);
    }
}

function generateTextReport(matches) {
    let report = '';

    let totalKills = 0;
    let playerStats = {};

    matches.forEach((match, index) => {
        report += `\n********** Game ${index + 1} **********\n`;
        report += `Total kills: ${match.totalKills}\n`;
        totalKills += match.totalKills;

        const players = Array.from(match.players);
        report += `Players: ${players.join(', ')}\n`;

        report += '\nKills per player:\n';
        Object.keys(match.kills).forEach(player => {
            report += `  ${player.padEnd(15, ' ')}: ${match.kills[player].toString().padStart(2, ' ')}\n`;

            if (!playerStats[player]) {
                playerStats[player] = 0;
            }
            playerStats[player] += match.kills[player];
        });

        report += '\nPlayer ranking (by kills):\n';
        const sortedPlayers = Object.keys(match.kills).sort((a, b) => match.kills[b] - match.kills[a]);
        sortedPlayers.forEach((player, rank) => {
            report += `  ${rank + 1}. ${player.padEnd(15, ' ')}: ${match.kills[player]} kills\n`;
        });
        report += `************************************\n`;
    });

    const numberOfGames = matches.length;
    const averageKills = totalKills / numberOfGames;

    report += `\n********** Overall Stats **********\n`;
    report += `Average kills per game: ${averageKills.toFixed(2)}\n`;
    report += `\nTop players overall:\n`;

    const sortedOverallPlayers = Object.keys(playerStats).sort((a, b) => playerStats[b] - playerStats[a]);
    sortedOverallPlayers.forEach((player, rank) => {
        report += `  ${rank + 1}. ${player.padEnd(15, ' ')}: ${playerStats[player]} total kills\n`;
    });
    report += `************************************\n`;

    return report;
}

function generateCSVReport(matches) {
    let csvReport = 'Game,Player,Total Kills,Ranking\n';

    matches.forEach((match, index) => {
        const gameNumber = index + 1;
        const sortedPlayers = Object.keys(match.kills).sort((a, b) => match.kills[b] - match.kills[a]);

        sortedPlayers.forEach((player, rank) => {
            const playerRanking = rank + 1;
            csvReport += `${gameNumber},${player},${match.kills[player]},${playerRanking}\n`;
        });

        csvReport += `${gameNumber},Total Kills,${match.totalKills},\n`;
    });

    const totalKills = matches.reduce((acc, match) => acc + match.totalKills, 0);
    const numberOfGames = matches.length;
    const averageKills = totalKills / numberOfGames;

    csvReport += `Overall Stats,,,\n`;
    csvReport += `Average Kills per Game,${averageKills.toFixed(2)},\n`;

    let playerStats = {};
    matches.forEach(match => {
        Object.keys(match.kills).forEach(player => {
            if (!playerStats[player]) {
                playerStats[player] = 0;
            }
            playerStats[player] += match.kills[player];
        });
    });

    csvReport += `Player,Total Kills,Ranking\n`;
    const sortedOverallPlayers = Object.keys(playerStats).sort((a, b) => playerStats[b] - playerStats[a]);
    sortedOverallPlayers.forEach((player, rank) => {
        csvReport += `${player},${playerStats[player]},${rank + 1}\n`;
    });

    return csvReport;
}

function generateJSONReport(parsedData) {
    return JSON.stringify(parsedData, null, 2);
}

const matches = parseLogFile('./qgames.log');
generateReport(matches);

export {
    validateMatchData,
    parseLogFile,
    parseKillLine,
    generateTextReport,
    generateCSVReport,
    generateJSONReport
};
