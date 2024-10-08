export function generateCSVReport(matches) {
    let csvReport = 'Game,Player,Total Kills,Ranking\n';

    matches.forEach((match, index) => {
        const gameNumber = index + 1;
        const sortedPlayers = Object.keys(match.kills).sort((a, b) => match.kills[b] - match.kills[a]);

        sortedPlayers.forEach((player, rank) => {
            const playerRanking = rank + 1;
            csvReport += `${gameNumber},${player},${match.kills[player]},${playerRanking}\n`;
        });

        csvReport += `${gameNumber},Total Kills,${match.totalKills},\n`;

        csvReport += 'Kills by Means of Death:\n';
        Object.keys(match.killsByMeans).forEach(means => {
            csvReport += `${gameNumber},${means},${match.killsByMeans[means]},\n`;
        });
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

    csvReport += `Overall Kills by Means of Death\n`;
    const overallMeansOfDeath = {};
    matches.forEach(match => {
        Object.keys(match.killsByMeans).forEach(means => {
            overallMeansOfDeath[means] = (overallMeansOfDeath[means] || 0) + match.killsByMeans[means];
        });
    });
    Object.keys(overallMeansOfDeath).forEach(means => {
        csvReport += `${means},${overallMeansOfDeath[means]}\n`;
    });

    return csvReport;
}
