import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
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
You will be given information about the current project in a &lt;Context&gt;&lt;/Context&gt; element.  This will include the full contents of every file in the project, using &lt;File&gt;&lt;/File&gt; elements.
Output your response using the following XML.
&lt;Output&gt;&lt;/Output&gt; - This is the root tag, your response must contain exactly one of these elements.
The &lt;Output&gt;&lt;/Output&gt; element contains a list of the following elements:
&lt;Thinking&gt;&lt;/Thinking&gt; - You may find it useful to use this space to think about the the user's request and to make a plan before making an action.
&lt;Message&gt;&lt;/Message&gt; - Use this element to display a message to the user. Write the message inside the tags, you may use markdown for formatting.
&lt;Command&gt;&lt;/Command&gt; - Execute the given command.  You may assume a unix operating system and the current working directory is set to the project root.
&lt;Patch&gt;&lt;/Patch&gt; - Include any code to be altered.  Use the following attributes to add metadata about the patch:
 - filename - the name of the file to be changed
 
 - type - use "change" for an existing file,  "create" for a new file, and  "delete" without any contents to delete a file.
Use HTML entity encoding where required to output valid html e.g. encode \`&lt;\` as \`&amp;lt;\` and \`&gt;\` as \`&amp;gt;\`
`;

  const filePaths = await getGitFiles();
  const context = await generateXmlInput(filePaths);

  rl.question('Enter a message to send to Claude: ', async (userMessage) => {
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {role: 'user', content: `<Context>${context}</Context>\n\n${userMessage}`}
      ],
      model: 'claude-3-opus-20240229',
    });
    
    console.log('Claude says:');
    console.log(response.content);

    await parseXmlOutput(
      response.content.filter(m => m.type === 'text').map(m => m.text).join("\n"),
    )

    rl.close();
  });
}

main();
