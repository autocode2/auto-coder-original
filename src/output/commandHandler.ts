import { colors } from './colors';

export const commandHandler = (contents: string) => {
  console.log(colors.command(`Command: ${contents}`));
  console.log();
};
