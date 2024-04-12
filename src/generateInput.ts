import fs from 'fs';
import path from 'path';

async function generateXmlInput(filePaths: string[]): Promise<string> {
  const builder = new xml2js.Builder();
  const filesystemData = {
    Filesystem: filePaths.map((filePath) => ({
      File: {
        _: await fs.promises.readFile(filePath, 'utf8'),
        $: { name: path.relative('.', filePath) },
      },
    })),
  };
  return builder.buildObject(filesystemData);
}

async function main() {
  const filePaths = process.argv.slice(2);
  if (filePaths.length === 0) {
    console.error('Please provide at least one file path as an argument.');
    return;
  }
  try {
    const xml = await generateXmlInput(filePaths);
    console.log(xml);
  } catch (error) {
    console.error('Error generating XML:', error);
  }
}

main();