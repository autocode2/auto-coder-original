import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function readUserMessage(inputFile?: string): Promise<string> {
  if (inputFile) {
    const userMessage = await fs.promises.readFile(inputFile, 'utf-8');
    console.log(`Message read from ${inputFile}:`);
    console.log(userMessage);

    const answer = await new Promise<string>(resolve => {
      rl.question('Send this message? (Y/n) ', resolve);
    });

    if (answer.toLowerCase() !== 'y') {
      console.log('Message sending cancelled');
      rl.close();
      process.exit(0);
    }

    return userMessage;
  } else {
    return new Promise(resolve => {
      rl.question('Enter a message to send to Claude: ', resolve);
    }); 
  }
}

export function writeCosts(usage: any, costs: any) {
  console.log(`Input tokens: ${usage.input_tokens}`);
  console.log(`Output tokens: ${usage.output_tokens}`);

  const inputCost = usage.input_tokens / 1000000 * costs.input;
  const outputCost = usage.output_tokens / 1000000 * costs.output;
  const totalCost = inputCost + outputCost;
  console.log(`Total cost: $${totalCost.toFixed(6)}`);
}

export async function writeOutputToFile(outputXml: string) {
  await fs.promises.writeFile('output.xml', outputXml);  
}