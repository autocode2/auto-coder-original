import { program } from 'commander';
import { generateXmlInput, getGitFiles } from './generateInput';
import { parseXmlOutput } from './parseOutput';
import { sendMessage } from './sendAIMessage';

program
  .command('generate-input')
  .description('Generate XML input from Git files')
  .action(async () => {
    const filePaths = await getGitFiles();
    const xml = await generateXmlInput(filePaths);
    console.log(xml);
  });

program
  .command('send-message')
  .description('Send a message to the AI and parse the response')
  .action(async () => {
    await sendMessage();
  });

program
  .command('parse-output <xmlFilePath>')
  .description('Parse XML output file')
  .action(async (xmlFilePath) => {
    await parseXmlOutput(xmlFilePath);
  });

program.parse();