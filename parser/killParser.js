export function parseKillLine(line) {
    const killRegex = /Kill:\s+\d+\s+\d+\s+\d+:\s+(.*?)\skilled\s(.*?)\sby\s(.*)$/;
    const match = line.match(killRegex);
    if (match) {
        const [, killer, victim, meansOfDeath] = match;
        return { 
            killer: killer.trim(), 
            victim: victim.trim(), 
            meansOfDeath: meansOfDeath.trim() 
        };
    }
    return null;
}
