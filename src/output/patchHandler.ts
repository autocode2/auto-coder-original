import fs from 'fs';
import path from 'path';
import { decode } from 'html-entities';

export const patchHandler = async (filename: string, contents: string) => {
  const decodedContents = decode(contents.trim());
  const filePath = path.join(process.cwd(), filename);
  await fs.promises.writeFile(filePath, decodedContents);
  console.log(`Wrote patch to ${filePath}`);
  console.log();
};
