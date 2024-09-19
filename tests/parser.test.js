import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateMatchData } from '../validator/matchValidator.js';
import { parseLogFile } from '../parser/logParser.js';
import { parseKillLine } from '../parser/killParser.js';
import { generateTextReport } from '../reportTypes/textReport.js';
import { generateCSVReport } from '../reportTypes/csvReport.js';
import { generateJSONReport } from '../reportTypes/jsonReport.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


describe('Log Parser Tests', () => {
  let testFilePath;
  let textFilePath;
  let csvFilePath;

  beforeEach(() => {
    testFilePath = path.join(__dirname, 'test-log.log');
    textFilePath = path.join(__dirname, 'test_report.txt');
    csvFilePath = path.join(__dirname, 'test_report.csv');
  });

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    if (fs.existsSync(textFilePath)) {
      fs.unlinkSync(textFilePath);
    }
    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }
  });

  test('should validate valid match data', () => {
    const validMatch = {
      totalKills: 10,
      players: new Set(['Player1', 'Player2']),
      kills: { 'Player1': 5, 'Player2': 5 }
    };

    expect(() => validateMatchData(validMatch)).not.toThrow();
  });

  test('should throw error for invalid match data', () => {
    const invalidMatch = { totalKills: 'ten', players: new Set(), kills: {} };

    expect(() => validateMatchData(invalidMatch)).toThrow('Invalid match data: totalKills should be a number.');
  });

  test('should throw error for missing players property', () => {
    const invalidMatch = { totalKills: 10, kills: {} };

    expect(() => validateMatchData(invalidMatch)).toThrow('Invalid match data: players should be a Set.');
  });

  test('should throw error for missing kills property', () => {
    const invalidMatch = { totalKills: 10, players: new Set() };

    expect(() => validateMatchData(invalidMatch)).toThrow('Invalid match data: kills should be an object.');
  });

  test('should parse a valid log file correctly', () => {
    const mockLogData = `
    0:00 InitGame: \\sv_floodProtect\\1\\sv_maxPing\\0\\sv_minPing\\0\\sv_maxRate\\10000\\sv_minRate\\0\\sv_hostname\\Code Miner Server\\g_gametype\\0\\sv_privateClients\\2\\sv_maxclients\\16\\sv_allowDownload\\0\\bot_minplayers\\0\\dmflags\\0\\fraglimit\\20\\timelimit\\15\\g_maxGameClients\\0\\capturelimit\\8\\version\\ioq3 1.36 linux-x86_64 Apr 12 2009\\protocol\\68\\mapname\\q3dm17\\gamename\\baseq3\\g_needpass\\0
    0:25 Kill: 1022 2 22: <world> killed Isgalamido by MOD_TRIGGER_HURT
    1:08 Kill: 3 2 10: Isgalamido killed Mocinha by MOD_RAILGUN
    1:26 Kill: 3 2 10: Isgalamido killed Mocinha by MOD_RAILGUN
    1:26 ShutdownGame:
    1:26 InitGame: \\sv_floodProtect\\1\\sv_maxPing\\0\\sv_minPing\\0\\sv_maxRate\\10000\\sv_minRate\\0\\sv_hostname\\Code Miner Server\\g_gametype\\0\\sv_privateClients\\2\\sv_maxclients\\16\\sv_allowDownload\\0\\bot_minplayers\\0\\dmflags\\0\\fraglimit\\20\\timelimit\\15\\g_maxGameClients\\0\\capturelimit\\8\\version\\ioq3 1.36 linux-x86_64 Apr 12 2009\\protocol\\68\\mapname\\q3dm17\\gamename\\baseq3\\g_needpass\\0
    1:35 Kill: 3 2 10: Isgalamido killed Mocinha by MOD_RAILGUN
    1:41 ShutdownGame:
    `.trim();

    const filePath = path.resolve(__dirname, 'test-log.txt');
    fs.writeFileSync(filePath, mockLogData);

    const parsedData = parseLogFile(filePath);
    console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));
    expect(parsedData.length).toBeGreaterThan(0);
    const firstMatch = parsedData[0];
    expect(firstMatch).toHaveProperty('totalKills');
    expect(Array.from(firstMatch.players)).toEqual(expect.arrayContaining(['Isgalamido', 'Mocinha']));
    expect(firstMatch.kills).toBeDefined();
    expect(firstMatch.killsByMeans).toBeDefined();

    const secondMatch = parsedData[1];
    expect(secondMatch).toHaveProperty('totalKills');
    expect(Array.from(secondMatch.players)).toEqual(expect.arrayContaining(['Isgalamido', 'Mocinha']));
    expect(secondMatch.kills).toBeDefined();
    expect(secondMatch.killsByMeans).toBeDefined();

    fs.unlinkSync(filePath);
});

test('parseKillLine should correctly parse kill line', () => {
    const line = 'Kill: 123 456 789: Killer1 killed Victim1 by MOD_RAILGUN';
    const result = parseKillLine(line);
    expect(result).toEqual({ killer: 'Killer1', victim: 'Victim1', meansOfDeath: 'Railgun'});
});

test('generateTextReport should create a valid report', () => {
    const matches = [
        { 
            totalKills: 3, 
            players: new Set(['Killer1', 'Victim1']),
            kills: { 'Killer1': 2, 'Victim1': 1 },
            killsByMeans: { 'MOD_RAILGUN': 2, 'MOD_TRIGGER_HURT': 1 }
        }
    ];
    const report = generateTextReport(matches);
    expect(report).toContain('********** Game 1 **********');
    expect(report).toContain('Total kills: 3');
    expect(report).toContain('Players: Killer1, Victim1');
    expect(report).toContain('Kills per player:');
    expect(report).toContain('Killer1        :  2');
    expect(report).toContain('Victim1        :  1');
    expect(report).toContain('Kills by means of death:');
    expect(report).toContain('MOD_RAILGUN         :  2');
    expect(report).toContain('MOD_TRIGGER_HURT    :  1');
    expect(report).toContain('Player ranking (by kills):');
    expect(report).toContain('1. Killer1        : 2 kills');
    expect(report).toContain('********** Overall Stats **********');
    expect(report).toContain('Average kills per game: 3.00');
    expect(report).toContain('Overall kills by means of death:');
    expect(report).toContain('MOD_RAILGUN         :  2');
    expect(report).toContain('MOD_TRIGGER_HURT    :  1');
    expect(report).toContain('Top players overall:');
    expect(report).toContain('1. Killer1        : 2 total kills');
    expect(report).toContain('2. Victim1        : 1 total kills');
});

test('generateCSVReport should create a valid CSV report', () => {
    const matches = [
        { 
            totalKills: 3, 
            players: new Set(['Killer1', 'Victim1']),
            kills: { 'Killer1': 2, 'Victim1': 1 },
            killsByMeans: { 'MOD_RAILGUN': 2, 'MOD_TRIGGER_HURT': 1 }
        }
    ];

    const csvReport = generateCSVReport(matches);
    expect(csvReport).toContain('Game,Player,Total Kills,Ranking');
    expect(csvReport).toContain('1,Killer1,2,1');
    expect(csvReport).toContain('1,Victim1,1,2');
    expect(csvReport).toContain('Overall Stats');
    expect(csvReport).toContain('Average Kills per Game,3.00');
    expect(csvReport).toContain('Killer1,2,1');
    expect(csvReport).toContain('Victim1,1,2');
    expect(csvReport).toContain('MOD_RAILGUN,2');
    expect(csvReport).toContain('MOD_TRIGGER_HURT,1');
});

  test('should generate correct JSON report', () => {
    const parsedData = {
      gameId: 1,
      players: [{ name: 'Player1', kills: 10, deaths: 2 }],
      totalKills: 15,
    };

    const jsonReport = generateJSONReport(parsedData);
    expect(jsonReport).toBe(JSON.stringify(parsedData, null, 2));
  });
});
