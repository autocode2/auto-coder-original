import fs from 'fs';
import readline from 'readline';
import Anthropic from '@anthropic-ai/sdk';
import ora from 'ora';
import { getGitFiles, generateXmlInput } from '../utils/gitUtils';
import { parseXmlOutput, XmlOutputHandlers } from '../utils/xmlUtils';
import { readUserMessage, writeCosts, writeOutputToFile } from '../utils/messageUtils';
import { readExcludesFile } from '../utils/excludeUtils';
import { thinkingHandler } from '../output/thinkingHandler';
import { messageHandler } from '../output/messageHandler';
import { commandHandler } from '../output/commandHandler';
import { patchHandler } from '../output/patchHandler';
import { errorHandler } from '../output/errorHandler';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const modelAliases: {[key: string]: string} = {
  opus: 'claude-3-opus-20240229',
  sonnet: 'claude-3-sonnet-20240229',
  haiku: 'claude-3-haiku-20240307'
};

const modelCosts = {
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
};

const systemPrompt = `You are an AI coding tool. Help the user with their coding tasks using the output format given.
You will be given information about the current project in a <Context></Context> element.  This will include the full contents of every file in the project, using <File></File> elements.  
Output your response using the following XML.
<Output></Output> - This is the root tag, your response must contain exactly one of these elements. 
The <Output></Output> element contains a list of the following elements:
<Thinking></Thinking> - You may find it useful to use this space to think about the the user's request and to make a plan before making an action.
<Message></Message> - Use this element to display a message to the user. Write the message inside the tags, you may use markdown for formatting.
<Command></Command> - Execute the given command.  You may assume a unix operating system and the current working directory is set to the project root.
<Patch></Patch> - Include any code to be altered. Always include the full code verbatim, do not elide any code, the contents of the tag will be used as the new contents of the file.  Use the following attributes to add metadata about the patch:
 - filename - the name of the file to be changed
 - type - use "change" for an existing file,  "create" for a new file, and  "delete" without any contents to delete a file.

Wrap the contents of <Message>, <Command>, and <Patch> tags in CDATA sections. Do not leave any space between the opening/closing tags and the CDATA section.
`;

const xmlOutputHandlers: XmlOutputHandlers = {
  onThinking: (contents: string) => console.log(`Thinking: ${contents}\n`),
  onMessage: (contents: string) => console.log(`Message: ${contents}\n`),
  onCommand: (contents: string) => console.log(`Command: ${contents}\n`),
  onPatch: async (filename, contents) => {
    await fs.promises.writeFile(filename, contents);
    console.log(`Wrote patch to ${filename}\n`); 
  },
  onError: (error: string) => console.error(`Error: ${error}\n`)
};

export async function sendMessage(options: {inputFile?: string, model: string, excludesFile?: string}) {
  const excludes = await readExcludesFile(options.excludesFile);
  const filePaths = await getGitFiles(excludes);
  const context = await generateXmlInput(filePaths);
  const userMessage = await readUserMessage(options.inputFile);

  const model = modelAliases[options.model] || options.model;
  
  const spinner = ora(`Sending message to Claude (${model})...`).start();
  const response = await anthropic.messages.create({
    max_tokens: 4096,
    system: systemPrompt,    
    messages: [
      {role: 'user', content: `<Context>${context}</Context>\n\n${userMessage}`}  
    ],
    model,
  });
  spinner.stop();
  
  writeCosts(response.usage, modelCosts[model as keyof typeof modelCosts]);
  
  const outputXml = response.content.filter(m => m.type === 'text').map(m => m.text).join("\n");
  await writeOutputToFile(outputXml);

  await parseXmlOutput(outputXml, xmlOutputHandlers);
}
