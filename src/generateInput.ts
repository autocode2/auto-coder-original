import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import { exec } from 'child_process';

export async function getGitFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('git ls-files', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim().split('\n'));
      }
    });
  });
}

export async function generateXmlInput(filePaths: string[]): Promise<string> {
  const builder = new xml2js.Builder({
    cdata: true
  });
  const filesystemData = {
    Filesystem: await Promise.all(filePaths.map(async (filePath) => ({
      File: {
        _: await fs.promises.readFile(filePath, 'utf8'),
        $: { name: path.relative('.', filePath) },
      },
    }))),
  };
  return builder.buildObject(filesystemData);
}