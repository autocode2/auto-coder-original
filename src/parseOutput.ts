import fs from 'fs';
import path from 'path';  
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

export async function parseXmlOutput(xml: string): Promise<void> {
  const regex = /<(Thinking|Message|Command|Patch)(?:\s+[^>]*)?>(?:(<!\[CDATA\[)([\s\S]*?)(\]\]>))?<\/\1>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const tagName = match[1];
    const hasCDATA = match[2] !== undefined;
    const contents = hasCDATA ? match[3] : match[0].slice(match[0].indexOf('>') + 1, -(`</${tagName}>`).length);
    
    switch (tagName) {
      case 'Thinking':
        onThinking(contents);
        break;
      case 'Message':
        onMessage(contents);
        break;
      case 'Command':
        onCommand(contents);
        break;
      case 'Patch':
        const filenameMatch = match[0].match(/filename="([^"]+)"/);
        if (!filenameMatch) {
          onError('<Patch> is missing required filename attribute');
          return;
        }
        const filename = filenameMatch[1];  
        await onPatch(filename, contents);
        break;
      default:
        onError(`Unknown tag <${tagName}>`);
    }
  }
}