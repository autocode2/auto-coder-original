# LLM Autocoder

## Introduction

This project is a tool to assist with writing code using large language models (LLMs) like Anthropic's Claude. The interesting thing is, the code for this tool itself was written entirely by an LLM! 

The tool allows you to have a conversation with the LLM to iteratively develop code. You provide it the current state of a codebase, and can make requests for the LLM to modify the code or provide explanations. It outputs code patches and messages using a special XML format.

## Usage

First make sure you have an API key for Anthropic and have it set as the `ANTHROPIC_API_KEY` environment variable.

The main interface is through the `llm-autocode` CLI:

To generate XML input from the current git project:

```
llm-autocode generate-input
```

To send a message to the assistant and get a response:

```
llm-autocode send-message
```

This will prompt you to enter a message. The assistant will generate patches and outputs in XML format which will be written to `output.xml`.

To parse and apply the XML output:

```
llm-autocode parse-output output.xml
```

This will display the assistant's response, and will apply any patches to the codebase.

You can also provide the initial message in a file:

```
llm-autocode send-message --input-file message.txt
```

And specify which LLM to use:

```
llm-autocode send-message --model claude-3-havoc-20240229
```

Some quick model aliases are available: `opus`, `sonnet` and `haiku`

To exclude certain files from being included, add their paths or globs to a `.llmignore` file, one per line.
