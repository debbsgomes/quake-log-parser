const meansOfDeathMap = {
    'MOD_UNKNOWN': 'Unknown',
    'MOD_SHOTGUN': 'Shotgun',
    'MOD_GAUNTLET': 'Gauntlet',
    'MOD_MACHINEGUN': 'Machinegun',
    'MOD_GRENADE': 'Grenade',
    'MOD_GRENADE_SPLASH': 'Grenade Splash',
    'MOD_ROCKET': 'Rocket',
    'MOD_ROCKET_SPLASH': 'Rocket Splash',
    'MOD_PLASMA': 'Plasma',
    'MOD_PLASMA_SPLASH': 'Plasma Splash',
    'MOD_RAILGUN': 'Railgun',
    'MOD_LIGHTNING': 'Lightning',
    'MOD_BFG': 'BFG',
    'MOD_BFG_SPLASH': 'BFG Splash',
    'MOD_WATER': 'Water',
    'MOD_SLIME': 'Slime',
    'MOD_LAVA': 'Lava',
    'MOD_CRUSH': 'Crush',
    'MOD_TELEFRAG': 'Telefrag',
    'MOD_FALLING': 'Falling',
    'MOD_SUICIDE': 'Suicide',
    'MOD_TARGET_LASER': 'Target Laser',
    'MOD_TRIGGER_HURT': 'Trigger Hurt',
    'MOD_NAIL': 'Nail',
    'MOD_CHAINGUN': 'Chaingun',
    'MOD_PROXIMITY_MINE': 'Proximity Mine',
    'MOD_KAMIKAZE': 'Kamikaze',
    'MOD_JUICED': 'Juiced',
    'MOD_GRAPPLE': 'Grapple'
};

export function parseKillLine(line) {
    const killRegex = /Kill:\s+\d+\s+\d+\s+\d+:\s+(.*?)\skilled\s(.*?)\sby\s(.*?)$/;
    const match = line.match(killRegex);
    if (match) {
        const [, killer, victim, meansOfDeath] = match;
        return { 
            killer: killer.trim(), 
            victim: victim.trim(), 
            meansOfDeath: meansOfDeath.trim() in meansOfDeathMap ? meansOfDeathMap[meansOfDeath.trim()] : 'Unknown'
        };
    }
    return null;
}

