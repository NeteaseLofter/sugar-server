import chalk from 'chalk';

export const success = (message: string) => {
  console.log(chalk.bold.green(`✓ ${message}`));
}

export const error = (message: string | Error) => {
  if (typeof message === 'string') {
    console.log(chalk.bold.red(`✘ ${message}`));
  } else {
    console.log(chalk.bold.red(`✘ some error`), error);
  }
}

export const warn = (message: string) => {
  console.log(chalk.bold.yellow(`⚠︎ ${message}`));
}

export const info = (message: string) => {
  console.log(chalk.bold.gray(`➤ ${message}`));
}

export const log = (message: string) => {
  console.log(message);
}
