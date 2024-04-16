import ora from 'ora';
import { getGitFiles, generateXmlInput } from '../utils/gitUtils';
import { readExcludesFile } from '../utils/excludeUtils';
import { minimatch } from 'minimatch';

export async function generateInput(options: {excludesFile?: string, focus?: string[]}) {
  const excludes = await readExcludesFile(options.excludesFile);
  const focus = options.focus || [];
  const spinner = ora('Generating input...').start();
  const filePaths = await getGitFiles(excludes, focus);
  const xml = await generateXmlInput(filePaths);
  spinner.stop();
  console.log(xml);
}
