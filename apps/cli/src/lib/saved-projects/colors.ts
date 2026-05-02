export const green = (message: string) => `\u001b[32m${message}\u001b[39m`;
export const boldGreen = (message: string) =>
  `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`;
export const boldRed = (message: string) =>
  `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`;
export const yellow = (message: string) => `\u001b[33m${message}\u001b[39m`;
export const boldYellow = (message: string) =>
  `\u001b[1m\u001b[33m${message}\u001b[39m\u001b[22m`;
export const grey = (message: string) => `\u001b[90m${message}\u001b[39m`;
export const boldGrey = (message: string) =>
  `\u001b[1m\u001b[90m${message}\u001b[39m\u001b[22m`;
export const bold = (message: string) => `\u001b[1m${message}\u001b[22m`;
export const boldBlue = (message: string) => bold(`\u001b[34m${message}\u001b[39m`);
