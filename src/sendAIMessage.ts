import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import fs from 'fs';
import { generateXmlInput, getGitFiles } from './generateInput';
import { parseXmlOutput } from './parseOutput';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const modelAliases = {
  opus: 'claude-3-opus-20240229',
  sonnet: 'claude-3-sonnet-20240229',
  haiku: 'claude-3-haiku-20240307'
};

export async function sendMessage(options: {inputFile?: string, model: string}) {
  const systemPrompt = `You are an AI coding tool. Help the user with their coding tasks using the output format given.
You will be given information about the current project in a <Context></Context> element.  This will include the full contents of every file in the project, using <File></File> elements.  
Output your response using the following XML.
<Output></Output> - This is the root tag, your response must contain exactly one of these elements. 
The <Output></Output> element contains a list of the following elements:
<Thinking></Thinking> - You may find it useful to use this space to think about the the user's request and to make a plan before making an action.
<Message></Message> - Use this element to display a message to the user. Write the message inside the tags, you may use markdown for formatting.
<Command></Command> - Execute the given command.  You may assume a unix operating system and the current working directory is set to the project root.
<Patch></Patch> - Include any code to be altered.  Use the following attributes to add metadata about the patch:
 - filename - the name of the file to be changed
 
 - type - use "change" for an existing file,  "create" for a new file, and  "delete" without any contents to delete a file.
Wrap the contents of <Message>, <Command>, and <Patch> tags in CDATA sections.
`;

  const filePaths = await getGitFiles();
  const context = await generateXmlInput(filePaths);
  
  let userMessage = '';

  if (options.inputFile) {
    userMessage = await fs.promises.readFile(options.inputFile, 'utf-8');
    console.log(`Message read from ${options.inputFile}:`);
    console.log(userMessage);

    const answer = await new Promise<string>(resolve => {
      rl.question('Send this message? (Y/n) ', resolve);
    });

    if (answer.toLowerCase() !== 'y') {
      console.log('Message sending cancelled');
      rl.close();
      return;
    }
  } else {  
    userMessage = await new Promise(resolve => {
      rl.question('Enter a message to send to Claude: ', resolve);
    });
  }

  const model = modelAliases[options.model] || options.model;
  
  const response = await anthropic.messages.create({
    max_tokens: 4096,
    system: systemPrompt,    
    messages: [
      {role: 'user', content: `<Context>${context}</Context>\n\n${userMessage}`}  
    ],
    model,
  });

  console.log(`Input tokens: ${response.usage.input_tokens}`);
  console.log(`Output tokens: ${response.usage.output_tokens}`); 
      
  const outputXml = response.content.filter(m => m.type === 'text').map(m => m.text).join("\n");
  await fs.promises.writeFile('output.xml', outputXml);

  await parseXmlOutput(outputXml);

  rl.close();  
}