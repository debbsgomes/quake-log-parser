export function validateMatchData(match) {
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
