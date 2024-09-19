import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions';

export async function getLLMResponse(prompt) {
    try {
        const response = await axios.post(apiUrl, {
            model: 'gpt-3.5-turbo',
            prompt: prompt,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].text.trim();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching response from LLM:', error.response ? error.response.data : error.message);
        return null;
    }
}

export function analyzeMatchData(matches) {
    const matchCount = matches.length;
    console.log('Matches Played:', matchCount);

    const uniquePlayers = new Set();
    matches.forEach(match => {
        match.players.forEach(player => uniquePlayers.add(player));
    });
    console.log('Unique Players:', uniquePlayers.size);

    const highestScoringPlayer = Object.entries(matches.reduce((acc, match) => {
        Object.entries(match.kills).forEach(([player, kills]) => {
            acc[player] = (acc[player] || 0) + kills;
        });
        return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0];
    
    return {
        totalMatches: matchCount,
        uniquePlayers: uniquePlayers.size,
        highestScorePlayer: highestScoringPlayer ? highestScoringPlayer[0] : 'None'
    };
}
