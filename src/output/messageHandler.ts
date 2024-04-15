import { colors } from './colors';

export const messageHandler = (contents: string) => {
  console.log(colors.message(`Message: ${contents}`));
  console.log();
};
