import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';

import packageJson from '../../package.json';
import {
  generateApp
} from '../core/generate-app';
import {
  initOptionsByPrompt
} from './init-options-by-prompt';

const program = new Command();

program
  .version(packageJson.version);

program.arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .option(
    '--template <path-to-template>',
    'specify a template for the created project'
  )
  .action(async (name, options) => {
    const data = await initOptionsByPrompt(options);
    await generateApp({
      targetDir: name,
      ...data
    })
  })

program.parse(process.argv);


