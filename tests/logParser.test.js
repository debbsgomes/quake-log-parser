import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateMatchData, parseLogFile, parseKillLine, generateTextReport, generateCSVReport, generateJSONReport } from '../logParser.js';

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

    // Check if matches are parsed
    expect(parsedData.length).toBeGreaterThan(0);  // Ensure at least one match is parsed

    // Simplified checks
    const firstMatch = parsedData[0];
    expect(firstMatch).toHaveProperty('totalKills');
    expect(Array.from(firstMatch.players)).toEqual(expect.arrayContaining(['Isgalamido', 'Mocinha']));
    expect(firstMatch.kills).toBeDefined();

    const secondMatch = parsedData[1];
    expect(secondMatch).toHaveProperty('totalKills');
    expect(Array.from(secondMatch.players)).toEqual(expect.arrayContaining(['Isgalamido', 'Mocinha']));
    expect(secondMatch.kills).toBeDefined();

    fs.unlinkSync(filePath);
});

  test('parseKillLine should correctly parse kill line', () => {
    const line = 'Kill: 123 456 789: Killer1 killed Victim1 by MOD';
    const result = parseKillLine(line);
    expect(result).toEqual({ killer: 'Killer1', victim: 'Victim1', meansOfDeath: 'MOD' });
  });

  test('generateTextReport should create a valid report', () => {
    const matches = [{ totalKills: 1, players: new Set(['Killer1', 'Victim1']), kills: { 'Killer1': 1 } }];
    const report = generateTextReport(matches);
    expect(report).toContain('********** Game 1 **********');
    expect(report).toContain('Total kills: 1');
    expect(report).toContain('Players: Killer1, Victim1');
    expect(report).toContain('Kills per player:');
    expect(report).toContain('Killer1        :  1');
    expect(report).toContain('Player ranking (by kills):');
    expect(report).toContain('1. Killer1        : 1 kills');
    expect(report).toContain('********** Overall Stats **********');
  });

  test('generateCSVReport should create a valid CSV report', () => {
    const matches = [
      { totalKills: 10, players: new Set(['Killer1', 'Victim1']), kills: { 'Killer1': 5, 'Victim1': 5 } },
      { totalKills: 8, players: new Set(['Killer1', 'Killer2']), kills: { 'Killer1': 3, 'Killer2': 5 } }
    ];

    const csvReport = generateCSVReport(matches);
    expect(csvReport).toContain('Game,Player,Total Kills,Ranking');
    expect(csvReport).toContain('1,Killer1,5,1');
    expect(csvReport).toContain('1,Victim1,5,2');
    expect(csvReport).toContain('2,Killer2,5,1');
    expect(csvReport).toContain('2,Killer1,3,2');
    expect(csvReport).toContain('Overall Stats');
    expect(csvReport).toContain('Average Kills per Game,9.00');
    expect(csvReport).toContain('Killer1,8,1');
    expect(csvReport).toContain('Killer2,5,3');
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
