import fs from 'fs';
import path from 'path';
import { parseXmlOutput, XmlOutputHandlers } from '../utils/xmlUtils';
import { decode } from 'html-entities';

const onThinking = (contents: string) => {
  console.log(`Thinking: ${contents}`);
  console.log();
};  

const onMessage = (contents: string) => {
  console.log(`Message: ${contents}`);
  console.log();    
};

const onCommand = (contents: string) => {
  console.log(`Command: ${contents}`);
  console.log();
};

const onPatch = async (filename: string, contents: string) => {
  const decodedContents = decode(contents.trim());
  const filePath = path.join(process.cwd(), filename);
  await fs.promises.writeFile(filePath, decodedContents);
  console.log(`Wrote patch to ${filePath}`);
  console.log();
};

const onError = (error: string) => {
  console.error(`Error: ${error}`);
  console.log();
};

const xmlOutputHandlers: XmlOutputHandlers = {
  onThinking,
  onMessage, 
  onCommand,
  onPatch,
  onError
};

export async function parseOutput(xmlFilePath: string) {
  const xml = await fs.promises.readFile(xmlFilePath, 'utf8');  
  await parseXmlOutput(xml, xmlOutputHandlers);
}