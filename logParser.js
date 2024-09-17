const fs = require('fs');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';

function debugLog(message) {
    if (isDevelopment) {
        console.debug(message);
    }
}

function parseLogFile(filePath) {
    let logData;
    try {
        logData = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }

    const lines = logData.split('\n');
    const matches = [];
    let currentMatch = null;

    lines.forEach(line => {
        if (line.startsWith('InitGame')) {
            if (currentMatch) {
                matches.push(currentMatch);
            }
            currentMatch = { totalKills: 0, players: new Set(), kills: {} };
        } else if (line.startsWith('ShutdownGame')) {
            if (currentMatch) {
                matches.push(currentMatch);
                currentMatch = null;
            }
        } else if (line.startsWith('Kill:')) {
            const killData = parseKillLine(line);

            if (killData) {
                processKillData(currentMatch, killData);
            }
        }
    });

    if (currentMatch) {
        matches.push(currentMatch);
    }

    return matches;
}

function processKillData(match, killData) {
    match.totalKills += 1;
    match.players.add(killData.killer);
    match.players.add(killData.victim);

    if (!match.kills[killData.killer]) {
        match.kills[killData.killer] = 0;
    }

    if (killData.killer === '<world>') {
        if (!match.kills[killData.victim]) {
            match.kills[killData.victim] = 0;
        }
        match.kills[killData.victim] -= 1;
    } else {
        match.kills[killData.killer] += 1;
    }
}


function parseKillLine(line) {
    const killRegex = /Kill:\s+\d+\s+\d+\s+\d+:\s+(.*)\skilled\s(.*)\sby\s(.*)/;
    const match = line.match(killRegex);
    if (match) {
        const [_, killer, victim, meansOfDeath] = match;

        if (!killer || !victim || !meansOfDeath) {
            console.warn(`Warning: Incomplete kill data found in line: ${line}`);
            return null;
        }

        return { killer, victim, meansOfDeath };
    } else {
        console.warn(`Warning: Line does not match expected kill format: ${line}`);
        return null;
    }
}


function generateReport(matches) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `game_report_${timestamp}`;

    try {
        const textFilePath = path.join(__dirname, `${baseFilename}.txt`);
        saveReport(textFilePath, generateTextReport(matches));

        const csvFilePath = path.join(__dirname, `${baseFilename}.csv`);
        saveReport(csvFilePath, generateCSVReport(matches));
    } catch (error) {
        console.error(`Error generating reports:`, error.message);
    }
}

function saveReport(filePath, content) {
    fs.writeFileSync(filePath, content);
    console.log(`Report saved to ${filePath}`);
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

function getTimestampedFileName(baseName, extension) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `${baseName}_${timestamp}.${extension}`;
}

const matches = parseLogFile('./qgames.log');
const outputFilePath = getTimestampedFileName('game_report', 'txt');
generateReport(matches, outputFilePath);
