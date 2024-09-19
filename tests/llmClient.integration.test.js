import { getLLMResponse, analyzeMatchData } from '../llm/llmClient.js';
import axios from 'axios';
import { jest } from '@jest/globals';

jest.mock('axios');

// Set up environment variables or other configuration here if needed

describe('Integration Tests for getLLMResponse', () => {
  beforeAll(() => {
    // Set up any global configuration here
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the response text when API call is successful', async () => {
    // Replace with a real prompt and ensure your API can handle this request
    const prompt = 'Prompt text.';
    axios.post.mockResolvedValue({
      data: {
        choices: [{ text: '...' }],
      },
    });

    const result = await getLLMResponse(prompt);
    expect(result).toBeDefined();
    expect(result).toBe('...');
  });

  it('should handle API call failure gracefully', async () => {
    const prompt = 'This prompt is invalid or will cause the API to fail.';
    axios.post.mockRejectedValue(new Error('API call failed'));

    const result = await getLLMResponse(prompt);
    expect(result).toBeNull();
  });
});

describe('Integration Tests for analyzeMatchData', () => {
  it('should correctly analyze match data', () => {
    const matches = [
      { players: ['Alice', 'Bob'], kills: { Alice: 3, Bob: 2 } },
      { players: ['Bob', 'Charlie'], kills: { Bob: 4, Charlie: 5 } }
    ];

    const result = analyzeMatchData(matches);

    expect(result.totalMatches).toBe(2);
    expect(result.uniquePlayers).toBe(3);
    expect(result.highestScorePlayer).toBe('Charlie');
  });

  it('should handle empty match data', () => {
    const matches = [];

    const result = analyzeMatchData(matches);

    expect(result.totalMatches).toBe(0);
    expect(result.uniquePlayers).toBe(0);
    expect(result.highestScorePlayer).toBe('None');
  });
});
