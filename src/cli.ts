import { generateXmlInput, getGitFiles } from './generateInput';
import { parseXmlOutput } from './parseOutput';
import { sendMessage } from './sendAIMessage';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'generate-input':
      const filePaths = await getGitFiles();
      const xml = await generateXmlInput(filePaths);
      console.log(xml);
      break;
    
    case 'send-message':
      await sendMessage();
      break;
    
    case 'parse-output':
      const xmlFilePath = process.argv[3];
      if (!xmlFilePath) {
        console.error('Please provide an XML file path.');
        return;
      }
      await parseXmlOutput(xmlFilePath);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Available commands: generate-input, send-message, parse-output');
  }
}

main();