import path from 'path';
import fsPromises, {
  constants
} from 'fs/promises';
import {
  spawn
} from 'child_process';

import * as logger from '../shared/logger';
import {
  downloadFromNpm
} from '../core/download-from-npm';

export interface GenerateAppParams {
  targetDir: string;
  template: string;
  packageManager: 'pnpm' | 'npm'
}

export async function generateApp (
  params: GenerateAppParams
) {
  const template = params.template;
  const packageName = `@sugar-templates/${template}`;

  const targetDir = path.resolve(
    process.cwd(),
    params.targetDir
  );

  try {
    const stat = await fsPromises.stat(targetDir)
    if (
      stat.isDirectory()
      || stat.isFile()
    ) {
      logger.error(`${targetDir} already exists.`);
      return;
    }
  } catch (e) {}
  logger.log(`creating dir: ${targetDir}`);
  await fsPromises.mkdir(targetDir, { recursive: true });

  logger.log(`downloading ${packageName}`);
  await downloadFromNpm(targetDir, packageName);

  logger.log('installing dependencies');

  await installDependencies({
    targetDir,
    packageManager: params.packageManager
  })

  logger.log('install dependencies success');

  logger.success('Done.');
}

function installDependencies (
  {
    targetDir,
    packageManager
  }: {
    targetDir: string;
    packageManager: 'pnpm' | 'npm';
  }
) {
  let command = 'npm';
  let args = [
    'install',
    '--no-audit',
    '--save',
    '--save-exact'
  ];

  if (packageManager === 'pnpm') {
    command = 'pnpm';
    args = [
      'install'
    ];
  }

  const child = spawn(
    command,
    args,
    {
      cwd: targetDir
    }
  );

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      resolve();
    });
  })
}