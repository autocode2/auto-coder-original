import fs from 'fs';
import xml2js from 'xml2js';

async function parseXmlOutput(filePath: string): Promise<any> {
  const xml = await fs.promises.readFile(filePath, 'utf8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  return result;
}

async function main() {
  const [, , xmlFilePath] = process.argv;
  if (!xmlFilePath) {
    console.error('Please provide an XML file path as the first argument.');
    return;
  }

  try {
    const output = await parseXmlOutput(xmlFilePath);
    console.log(output);
  } catch (error) {
    console.error('Error parsing XML:', error);
  }
}

main();
