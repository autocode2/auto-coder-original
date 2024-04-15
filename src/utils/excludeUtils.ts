import fs from 'fs';
import path from 'path';

const defaultExcludesFile = '.llmignore';

export async function readExcludesFile(excludesFile: string = defaultExcludesFile): Promise<string[]> {
  if (fs.existsSync(excludesFile)) {
    const contents = await fs.promises.readFile(excludesFile, 'utf-8');
    return contents.split('\n').map(line => line.trim()).filter(line => line);
  } else {
    return [];
  }  
}