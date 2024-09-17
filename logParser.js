const fs = require('fs');

function parseLogFile(filePath) {
  const logData = fs.readFileSync(filePath, 'utf-8');
  const lines = logData.split('\n');

  const matches = [];
  let currentMatch = null;

  lines.forEach(line => {
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
    matches.forEach((match, index) => {
        console.log(`\n========== Game ${index + 1} ==========`);
        console.log(`Total Kills: ${match.totalKills}`);
        
        // Convert the players Set to an array for display
        const players = Array.from(match.players);
        console.log(`Players: ${players.join(', ')}`);
        
        console.log('\n--- Kill Summary ---');
        Object.keys(match.kills).forEach(player => {
            const killCount = match.kills[player];
            const killLabel = Math.abs(killCount) === 1 ? 'kill' : 'kills';
            console.log(`  ${player}: ${killCount} ${killLabel}`);
        });

        console.log('\n--- Player Ranking (by kills) ---');
        const sortedPlayers = Object.keys(match.kills).sort((a, b) => match.kills[b] - match.kills[a]);
        sortedPlayers.forEach((player, rank) => {
            const killCount = match.kills[player];
            const killLabel = Math.abs(killCount) === 1 ? 'kill' : 'kills';
            console.log(`  ${rank + 1}. ${player}: ${killCount} ${killLabel}`);
        });
        
        console.log('===============================\n');
    });
}

const matches = parseLogFile('./qgames.log');
generateReport(matches);
