import fs from 'fs';
import { parseXmlOutput } from '../utils/xmlUtils';

export async function parseOutput(xmlFilePath: string) {
  const xml = await fs.promises.readFile(xmlFilePath, 'utf8');  
  await parseXmlOutput(xml);
}