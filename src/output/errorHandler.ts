import { colors } from './colors';

export const errorHandler = (error: string) => {
  console.error(colors.error(`Error: ${error}`));
  console.log();
};
