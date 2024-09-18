import openai from './llmClient.js';

async function getMatchData() {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'How many matches were played?',
        },
      ],
    });

    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
  }
}

getMatchData();
