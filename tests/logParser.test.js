import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseLogFile, parseKillLine, generateTextReport, generateCSVReport } from '../logParser.js';

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

  test('parseLogFile should correctly parse a log file', () => {
    const mockLogData = `InitGame\nKill: 123 456 789: Killer1 killed Victim1 by MOD\nShutdownGame`;
    fs.writeFileSync(testFilePath, mockLogData);

    const result = parseLogFile(testFilePath);
    expect(result).toHaveLength(1); // Assuming there is only one match
    expect(result[0].totalKills).toBe(1);
    expect(result[0].players).toContain('Killer1');
    expect(result[0].players).toContain('Victim1');
    expect(result[0].kills['Killer1']).toBe(1);
    expect(result[0].kills['Victim1'] || 0).toBe(0); // Handle undefined

    fs.unlinkSync(testFilePath);
  });

  test('parseKillLine should correctly parse kill line', () => {
    const line = 'Kill: 123 456 789: Killer1 killed Victim1 by MOD';
    const result = parseKillLine(line);
    expect(result).toEqual({ killer: 'Killer1', victim: 'Victim1', meansOfDeath: 'MOD' });
  });

  test('generateTextReport should create a valid report', () => {
    const matches = [{ totalKills: 1, players: new Set(['Killer1', 'Victim1']), kills: { 'Killer1': 1 } }];
    const report = generateTextReport(matches);
    expect(report).toContain('Game 1:');
    expect(report).toContain('Total kills: 1');
    expect(report).toContain('Players: Killer1, Victim1');
  });

  test('generateCSVReport should create a valid CSV report', () => {
    const matches = [{ totalKills: 1, players: new Set(['Killer1', 'Victim1']), kills: { 'Killer1': 1 } }];
    const csvReport = generateCSVReport(matches);
    expect(csvReport).toContain('Game,Player,Total Kills,Ranking');
    expect(csvReport).toContain('1,Killer1,1,1');
  });
});
