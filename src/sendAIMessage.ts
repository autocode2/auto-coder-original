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

async function main() {
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

  rl.question('Enter a message to send to Claude: ', async (userMessage) => {
    const response = await anthropic.messages.create({
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {role: 'user', content: `<Context>${context}</Context>\n\n${userMessage}`}
      ],
      model: 'claude-3-opus-20240229',
    });
    
    console.log('Claude says:');
    console.log(response.content);

    const outputXml = response.content.filter(m => m.type === 'text').map(m => m.text).join("\n");
    await fs.promises.writeFile('output.xml', outputXml);

    await parseXmlOutput(outputXml);

    rl.close();
  });
}

main();