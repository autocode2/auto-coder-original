import ora from 'ora';
import { getGitFiles, generateXmlInput } from '../utils/gitUtils';
import { readExcludesFile } from '../utils/excludeUtils';

export async function generateInput(options: {excludesFile?: string}) {
  const excludes = await readExcludesFile(options.excludesFile);
  const spinner = ora('Generating input...').start();
  const filePaths = await getGitFiles(excludes);
  const xml = await generateXmlInput(filePaths);
  spinner.stop();
  console.log(xml);
}