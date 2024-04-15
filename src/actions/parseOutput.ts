import fs from 'fs';
import path from 'path';
import { parseXmlOutput, XmlOutputHandlers } from '../utils/xmlUtils';
import { decode } from 'html-entities';
import { thinkingHandler } from '../output/thinkingHandler';
import { messageHandler } from '../output/messageHandler';
import { commandHandler } from '../output/commandHandler';
import { patchHandler } from '../output/patchHandler';
import { errorHandler } from '../output/errorHandler';

const xmlOutputHandlers: XmlOutputHandlers = {
  onThinking: thinkingHandler,
  onMessage: messageHandler,
  onCommand: commandHandler,
  onPatch: patchHandler,
  onError: errorHandler
};

export async function parseOutput(xmlFilePath: string) {
  const xml = await fs.promises.readFile(xmlFilePath, 'utf8');  
  await parseXmlOutput(xml, xmlOutputHandlers);
}