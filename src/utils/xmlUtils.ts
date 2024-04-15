import { decode } from 'html-entities';

export interface XmlOutputHandlers {
  onThinking: (contents: string) => void;
  onMessage: (contents: string) => void;
  onCommand: (contents: string) => void;
  onPatch: (filename: string, contents: string) => Promise<void>;
  onError: (error: string) => void;
}

export async function parseXmlOutput(xml: string, handlers: XmlOutputHandlers): Promise<void> {
  const regex = /<(Thinking|Message|Command|Patch)(?:\s+[^>]*)?>(?:\s*(<!\[CDATA\[)([\s\S]*?)(\]\]>))?<\/\1>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const tagName = match[1];
    const hasCDATA = match[2] !== undefined;
    const contents = hasCDATA ? match[3] : match[0].slice(match[0].indexOf('>') + 1, -(`</${tagName}>`).length);
    
    switch (tagName) {
      case 'Thinking':
        handlers.onThinking(contents);
        break;
      case 'Message':
        handlers.onMessage(contents);
        break;
      case 'Command':
        handlers.onCommand(contents);
        break;
      case 'Patch':
        const filenameMatch = match[0].match(/filename="([^"]+)"/);
        if (!filenameMatch) {
          handlers.onError('<Patch> is missing required filename attribute');
          return;
        }
        const filename = filenameMatch[1];  
        await handlers.onPatch(filename, contents);
        break;
      default:
        handlers.onError(`Unknown tag <${tagName}>`);
    }
  }
}