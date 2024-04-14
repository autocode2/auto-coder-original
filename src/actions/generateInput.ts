import { getGitFiles, generateXmlInput } from '../utils/gitUtils';

export async function generateInput() {
  const filePaths = await getGitFiles();
  const xml = await generateXmlInput(filePaths);
  console.log(xml);
}