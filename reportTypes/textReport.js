export function generateTextReport(matches) {
    let report = '';

    let totalKills = 0;
    let playerStats = {};
    let meansOfDeathStats = {};

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

        report += '\nKills by means of death:\n';
        Object.keys(match.killsByMeans).forEach(means => {
            report += `  ${means.padEnd(20, ' ')}: ${match.killsByMeans[means].toString().padStart(2, ' ')}\n`;
            
            if (!meansOfDeathStats[means]) {
                meansOfDeathStats[means] = 0;
            }
            meansOfDeathStats[means] += match.killsByMeans[means];
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
    report += `\nOverall kills by means of death:\n`;
    Object.keys(meansOfDeathStats).forEach(means => {
        report += `  ${means.padEnd(20, ' ')}: ${meansOfDeathStats[means].toString().padStart(2, ' ')}\n`;
    });

    report += `\nTop players overall:\n`;
    const sortedOverallPlayers = Object.keys(playerStats).sort((a, b) => playerStats[b] - playerStats[a]);
    sortedOverallPlayers.forEach((player, rank) => {
        report += `  ${rank + 1}. ${player.padEnd(15, ' ')}: ${playerStats[player]} total kills\n`;
    });
    report += `************************************\n`;

    return report;
}
