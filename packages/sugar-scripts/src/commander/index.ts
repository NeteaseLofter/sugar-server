import path from 'path';

import { Command } from 'commander';

import packageInfo from '../../package.json';

import {
  build
} from '../core/build';
import {
  info
} from '../core/info';
import {
  clean as cacheClean
} from '../core/cache';
import {
  findPackage
} from '../shared/file-helpers';

const program = new Command();
program
  .version(packageInfo.version);

program
  .command('info')
  .description('工程信息')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (source, options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd
    const {
      root,
      packageJson
    } = await findPackage(dir);

    // process.exit();
  })

program
  .command('build')
  .description('构建服务')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (source, options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd
    const {
      root,
      packageJson,
      packageConfig
    } = await findPackage(dir);
    const stats = await build(
      {
        root,
        packageName: packageJson.name,
        ...packageConfig
      }
    )
    console.log(stats);
    console.log('构建成功');
    // process.exit();
  })


const cacheCommand = new Command();
cacheCommand
  .name('cache')
  .description('构建缓存管理');

cacheCommand
  .command('clean')
  .description('清理构建缓存')
  .action(async () => {
    await cacheClean();
    console.log('清理构建缓存成功');
  })

program.addCommand(cacheCommand)

program
  .command('dev')
  .description('启动开发服务')
  .action(async (source, options, command) => {
    // process.exit();
  })

program.parse(process.argv);
