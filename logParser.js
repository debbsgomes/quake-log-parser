const fs = require('fs');
const path = require('path');
const logger = require('./logger');

function parseLogFile(filePath) {
    let logData;
    try {
        logData = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        logger.error(`Error reading file ${filePath}: ${error.message}`);
        return [];
    }

    const lines = logData.split('\n');
    const matches = [];
    let currentMatch = null;

    lines.forEach(line => {
        try {
            if (line.includes('InitGame')) {
                if (currentMatch) {
                    matches.push(currentMatch);
                }
                currentMatch = { totalKills: 0, players: new Set(), kills: {} };
            } else if (line.includes('ShutdownGame')) {
                if (currentMatch) {
                    matches.push(currentMatch);
                    currentMatch = null;
                }
            } else if (line.includes('Kill:')) {
                const killData = parseKillLine(line);

                if (killData) {
                    currentMatch.totalKills += 1;
                    currentMatch.players.add(killData.killer);
                    currentMatch.players.add(killData.victim);

                    if (!currentMatch.kills[killData.killer]) {
                        currentMatch.kills[killData.killer] = 0;
                    }

                    if (killData.killer === '<world>') {
                        if (!currentMatch.kills[killData.victim]) {
                            currentMatch.kills[killData.victim] = 0;
                        }
                        currentMatch.kills[killData.victim] -= 1;
                    } else {
                        currentMatch.kills[killData.killer] += 1;
                    }
                }
            }
        } catch (error) {
            logger.error(`Error processing line "${line}": ${error.message}`);
        }
    });

    if (currentMatch) {
        matches.push(currentMatch);
    }

    return matches;
}

function parseKillLine(line) {
    const killRegex = /Kill:\s+\d+\s+\d+\s+\d+:\s+(.*)\skilled\s(.*)\sby\s(.*)/;
    const match = line.match(killRegex);
    if (match) {
        const [_, killer, victim, meansOfDeath] = match;
        return { killer, victim, meansOfDeath };
    }
    return null;
}

function generateReport(matches) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFilename = `game_report_${timestamp}`;

        const textFilePath = path.join(__dirname, `${baseFilename}.txt`);
        const textReport = generateTextReport(matches);
        fs.writeFileSync(textFilePath, textReport);
        console.log(`Text report saved to ${textFilePath}`);

        const csvFilePath = path.join(__dirname, `${baseFilename}.csv`);
        const csvReport = generateCSVReport(matches);
        fs.writeFileSync(csvFilePath, csvReport);
        console.log(`CSV report saved to ${csvFilePath}`);
    } catch (error) {
        logger.error(`Error generating reports: ${error.message}`);
    }
}

function generateTextReport(matches) {
    let report = '';

    let totalKills = 0;
    let playerStats = {};

    matches.forEach((match, index) => {
        report += `\nGame ${index + 1}:\n`;
        report += `Total kills: ${match.totalKills}\n`;
        totalKills += match.totalKills;

        const players = Array.from(match.players);
        report += `Players: ${players.join(', ')}\n`;

        report += 'Kills:\n';
        Object.keys(match.kills).forEach(player => {
            report += `  ${player}: ${match.kills[player]}\n`;

            if (!playerStats[player]) {
                playerStats[player] = 0;
            }
            playerStats[player] += match.kills[player];
        });

        report += 'Player ranking (by kills):\n';
        const sortedPlayers = Object.keys(match.kills).sort((a, b) => match.kills[b] - match.kills[a]);
        sortedPlayers.forEach((player, rank) => {
            report += `  ${rank + 1}. ${player}: ${match.kills[player]} kills\n`;
        });
    });

    const numberOfGames = matches.length;
    const averageKills = totalKills / numberOfGames;

    report += `\nOverall Stats:\n`;
    report += `Average kills per game: ${averageKills.toFixed(2)}\n`;
    report += `Top player overall:\n`;

    const sortedOverallPlayers = Object.keys(playerStats).sort((a, b) => playerStats[b] - playerStats[a]);
    sortedOverallPlayers.forEach((player, rank) => {
        report += `  ${rank + 1}. ${player}: ${playerStats[player]} total kills\n`;
    });

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
    });

    return csvReport;
}

const matches = parseLogFile('./qgames.log');
generateReport(matches);

