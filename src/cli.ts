import { program } from 'commander';
import { generateInput } from './actions/generateInput';
import { sendMessage } from './actions/sendMessage';
import { parseOutput } from './actions/parseOutput';

program
  .command('generate-input')
  .description('Generate XML input from Git files')
  .option('-x, --excludes-file <file>', 'File containing list of files to exclude')
  .option<string[]>('-f, --focus <glob>', 'Minimatch glob pattern to focus on', (val: string, prev: string[]) => ([...prev, val]), [] as string[])
  .action(generateInput);

program
  .command('send-message')
  .description('Send a message to the AI and parse the response')  
  .option('-i, --input-file <file>', 'Read message from file')
  .option('-m, --model <name>', 'Model name or alias to use (opus, sonnet, haiku)', 'opus')
  .option('-x, --excludes-file <file>', 'File containing list of files to exclude')
  .option<string[]>('-f, --focus <glob>', 'Minimatch glob pattern to focus on', (val: string, prev: string[]) => ([...prev, val]), [] as string[])
  .action(sendMessage);

program
  .command('parse-output <xmlFilePath>')
  .description('Parse XML output file')
  .action(parseOutput);

program.parse();
