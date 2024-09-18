import { parseKillLine } from './killParser.js';
import { readLogFile } from './logReader.js';

export function parseLogFile(filePath) {
    const logData = readLogFile(filePath);
    const lines = logData.split('\n');
    const matches = [];
    let currentMatch = null;

    lines.forEach((line) => {
        if (line.includes('InitGame')) {
            if (currentMatch && currentMatch.totalKills > 0) {
                matches.push(currentMatch);
            }
            currentMatch = { totalKills: 0, players: new Set(), kills: {} };
        } else if (line.includes('ShutdownGame')) {
            if (currentMatch && currentMatch.totalKills > 0) {
                matches.push(currentMatch);
                currentMatch = null;
            }
        } else if (line.includes('Kill:')) {
            const killData = parseKillLine(line);
            if (killData && currentMatch) {
                currentMatch.totalKills += 1;
                currentMatch.players.add(killData.killer);
                currentMatch.players.add(killData.victim);
                if (killData.killer !== '<world>') {
                    currentMatch.kills[killData.killer] = (currentMatch.kills[killData.killer] || 0) + 1;
                }
            }
        }
    });

    if (currentMatch && currentMatch.totalKills > 0) {
        matches.push(currentMatch);
    }

    return matches;
}