import { colors } from './colors';

export const thinkingHandler = (contents: string) => {
  console.log(colors.thinking(`Thinking: ${contents}`));
  console.log();
};
