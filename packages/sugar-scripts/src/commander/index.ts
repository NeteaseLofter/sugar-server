import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';

import packageInfo from '../../package.json';

import {
  initRunningProject
} from '../core/init-running-project';
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
  runApplication
} from '../core/run-application';
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
    } = await initRunningProject(dir);
    const stats = await build(
      {
        root,
        packageName: packageJson.name,
        ...packageConfig
      }
    )
    // console.log(stats);
    console.log(`✅ ${chalk.bold.green('构建成功')}`);
    // process.exit();
  })


const cacheCommand = new Command();
cacheCommand
  .name('cache')
  .description('构建缓存管理');

cacheCommand
  .command('clean')
  .description('清理构建缓存')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (source, options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd;
    await initRunningProject(dir)
    await cacheClean();
    console.log(`✅ ${chalk.bold.green('清理构建缓存成功')}`);
  })

program.addCommand(cacheCommand)

program
  .command('start')
  .description('启动开发服务')
  .argument('<source>', '导出Application的文件')
  .option('--port <port>', '指定运行的端口')
  .action(async (source, options, command) => {
    const cwd = process.cwd();
    const port = +options.port;

    const App = require(
      path.resolve(cwd, source)
    ).default;

    runApplication(
      App,
      port
    );
    console.log(`✅ ${chalk.bold.green(`启动服务成功，端口:${port}`)}`);
  })

program.parse(process.argv);
