import fs from 'fs';

const onThinking = (contents: string) => {
  console.log(`Thinking: ${contents}`);
};

const onMessage = (contents: string) => {  
  console.log(`Message: ${contents}`);
};

const onCommand = (contents: string) => {
  console.log(`Command: ${contents}`);  
};

const onPatch = (contents: string) => {
  console.log(`Patch: ${contents}`);
};

const onError = (error: string) => {
  console.error(`Error: ${error}`);
};

export async function parseXmlOutput(filePath: string): Promise<void> {
  const xml = await fs.promises.readFile(filePath, 'utf8');
  
  const regex = /<(Thinking|Message|Command|Patch)(?:\s+[^>]*)?\>/g;
  let match;
  let index = 0;
  
  while ((match = regex.exec(xml)) !== null) {
    const tagName = match[1];
    const startIndex = match.index + match[0].length;
    const endTag = `</${tagName}>`;
    const endIndex = xml.indexOf(endTag, startIndex);
    
    if (endIndex === -1) {
      onError(`Missing closing tag for <${tagName}>`);
      return;
    }
    
    const contents = xml.slice(startIndex, endIndex).trim();
    
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
        onPatch(contents);
        break;
      default:
        onError(`Unknown tag <${tagName}>`);
    }
    
    index = endIndex + endTag.length;
    regex.lastIndex = index;
  }
}

async function main() {
  const [, , xmlFilePath] = process.argv;
  if (!xmlFilePath) {
    console.error('Please provide an XML file path as the first argument.');
    return;
  }
  try {
    await parseXmlOutput(xmlFilePath);
  } catch (error) {
    console.error('Error parsing XML:', error);
  }
}

main();