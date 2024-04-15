import fs from 'fs';
import path from 'path';
import { decode } from 'html-entities';
import { colors } from './colors';

export const patchHandler = async (filename: string, contents: string) => {
  const decodedContents = decode(contents.trim());
  const filePath = path.join(process.cwd(), filename);
  await fs.promises.writeFile(filePath, decodedContents);
  console.log(colors.patch(`Wrote patch to ${filePath}`));
  console.log();
};
