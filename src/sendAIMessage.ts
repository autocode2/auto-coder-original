import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  rl.question('Enter a message to send to Claude: ', async (userMessage) => {
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: 'user', content: userMessage }],
      model: 'claude-3-opus-20240229',
    });
    
    console.log('Claude says:');
    console.log(response.content);

    rl.close();
  });
}

main();