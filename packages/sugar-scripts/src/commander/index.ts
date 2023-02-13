import path from 'path';
import { Command } from 'commander';

import * as logger from '../shared/logger';
import {
  initRunningContext
} from '../core/init-running-context';
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

const program = new Command();
program
  .version('1.0.0');

program
  .command('info')
  .description('工程信息')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd
    // process.exit();
  })

program
  .command('build')
  .description('构建服务')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd

    const context = await initRunningContext(dir);
    await build(
      context
    );
    logger.success('build success');
  })


const cacheCommand = new Command();
cacheCommand
  .name('cache')
  .description('构建缓存管理');

cacheCommand
  .command('clean')
  .description('清理构建缓存')
  .option('--dir <dir>', '自定义运行的目录')
  .action(async (options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd;
    const context = await initRunningContext(dir);
    await cacheClean(context);
    logger.success('clean success');
  })

program.addCommand(cacheCommand)

program
  .command('start')
  .description('启动开发服务')
  .option('--dir <dir>', '自定义运行的目录')
  .option('--port <port>', '指定运行的端口')
  .action(async (options, command) => {
    const cwd = process.cwd();
    const dir = options.dir ? path.resolve(cwd, options.dir) : cwd
    const port = +options.port;

    const context = await initRunningContext(dir);
    const appFilePath = context.getStartFilePath()

    if (!appFilePath) return;
    const App = require(
      appFilePath
    ).default;

    runApplication(
      App,
      port
    );
    logger.success(`启动服务成功，端口:${port}`);
  })

program.parse(process.argv);
