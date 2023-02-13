import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

import * as tsNode from 'ts-node';

import * as logger from '../shared/logger';
import {
  SUGAR_PACKAGE_CONFIG_FILENAME,
  SUGAR_PROJECT_CONFIG_FILENAME
} from '../constants';
import {
  SugarScriptsProject
} from '../custom-config.type';

// nodejs v10 支持
// nodejs v14 才开始支持require('fs/promises')
const fsPromises = fs.promises;

export const searchFiles = async (
  dir: string,
  fileCheck: string | ((filePath: string) => boolean),
  exclude?: string
) => {
  try {
    await fsPromises.access(dir)
  } catch (e) {
    return [];
  }
  const files = await fsPromises.readdir(dir);
  let currentFiles: string[] = [];

  await Promise.all(
    files.map(async (filename) => {
      if (exclude === filename) return;
      const fileOrDir = path.join(dir, filename);
      const stats = await fsPromises.stat(fileOrDir);
      if (stats.isFile()) {
        if (typeof fileCheck === 'string') {
          if (filename === fileCheck) {
            currentFiles.push(fileOrDir)
          }
        } else if (fileCheck(fileOrDir)) {
          currentFiles.push(fileOrDir)
        }
      } else if (stats.isDirectory()) {
        const childCurrentFiles = await searchFiles(fileOrDir, fileCheck);
        currentFiles = currentFiles.concat(childCurrentFiles);
      }
    })
  )
  return currentFiles;
}

export const findSiblingFile = async (
  currentFilePath: string,
  searchFileName: string
) => {
  const dir = path.dirname(currentFilePath);
  const searchFilePath = path.join(dir, searchFileName);

  const searchFileStat = await fsPromises.stat(searchFilePath);
  if (searchFileStat.isFile()) {
    return searchFilePath;
  }

  return null;
}

export const findParentFile = async (
  currentFilePath: string,
  searchFileName: string
) => {
  const dir = path.resolve(
    path.dirname(currentFilePath),
    '../'
  );
  const searchFilePath = path.join(dir, searchFileName);

  const searchFileStat = await fsPromises.stat(searchFilePath);
  if (searchFileStat.isFile()) {
    return searchFilePath;
  }

  return null;
}

export const loadJSON = async (filePath: string) => {
  try {
    const contentBuffer = await fsPromises.readFile(filePath);
    const content = contentBuffer.toString();

    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

export const writeFileSync = (
  filePath: string,
  data: string | NodeJS.ArrayBufferView
) => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    filePath,
    data
  )
}

export const findPackage = async (dir: string): Promise<{
  root: string;
  packageJson: any;
  packageConfigs: SugarScriptsProject.SugarPackageConfigs | null;
}> => {
  const packagePath = path.resolve(dir, 'package.json');

  let existed = true;
  try {
    await fsPromises.access(packagePath, fs.constants.F_OK);
  } catch (e) {
    existed = false;
  }

  let packageConfigs = null;
  const sugarPackagePath = path.resolve(
    dir,
    SUGAR_PACKAGE_CONFIG_FILENAME
  );
  let existedFile = '';
  try {
    await fsPromises.access(sugarPackagePath + '.ts', fs.constants.F_OK);
    existedFile = sugarPackagePath + '.ts';
  } catch (e) {}

  if (!existedFile) {
    try {
      await fsPromises.access(sugarPackagePath + '.js', fs.constants.F_OK);
      existedFile = sugarPackagePath + '.js';
    } catch (e) {}
  }

  if (existedFile) {
    tsNode.register({
      cwd: dir,
      projectSearchDir: dir,
      project: path.resolve(dir, './tsconfig.json'),
      transpileOnly: true,
      require: [
        existedFile
      ]
    });

    logger.success(`find ${SUGAR_PACKAGE_CONFIG_FILENAME}: ${existedFile}`);

    try {
      packageConfigs = require(existedFile);
    } catch (e) {
      throw e;
    }
  }

  if (existed) {
    if (!packageConfigs) {
      throw new Error(`not found ${SUGAR_PACKAGE_CONFIG_FILENAME}`);
    }
    return {
      root: dir,
      packageJson: require(
        packagePath
      ),
      packageConfigs
    };
  }

  if (dir === '/') {
    throw new Error('not found package.json');
  }

  return findPackage(
    path.resolve(dir, '../')
  )
}

export const findProject = async (dir: string): Promise<{
  projectRoot: string,
  projectConfigs: SugarScriptsProject.SugarProjectConfigs
}> => {
  const projectPath = path.resolve(
    dir,
    SUGAR_PROJECT_CONFIG_FILENAME
  );

  let projectConfigs = null;
  let existedFile = '';
  try {
    await fsPromises.access(projectPath + '.ts', fs.constants.F_OK);
    existedFile = projectPath + '.ts';
  } catch (e) {}

  if (!existedFile) {
    try {
      await fsPromises.access(projectPath + '.js', fs.constants.F_OK);
      existedFile = projectPath + '.js';
    } catch (e) {}
  }

  if (existedFile) {
    tsNode.register({
      cwd: dir,
      projectSearchDir: dir,
      project: path.resolve(dir, './tsconfig.json'),
      transpileOnly: true,
      require: [
        existedFile
      ]
    });

    logger.success(`find ${SUGAR_PROJECT_CONFIG_FILENAME}: ${existedFile}`);

    try {
      projectConfigs = require(existedFile);
    } catch (e) {
      throw e;
    }

    if (projectConfigs) {
      return {
        projectRoot: dir,
        projectConfigs
      };
    }
  }

  if (dir === '/') {
    throw new Error(`not found ${SUGAR_PROJECT_CONFIG_FILENAME}`);
  }

  return findProject(
    path.resolve(dir, '../')
  )

}

export const rm = async (filePath: string) => {
  const stat = await fsPromises.stat(filePath);
  if (
    stat.isFile()
    || stat.isSymbolicLink()
  ) {
    await fsPromises.unlink(filePath);
    return;
  }
  if (stat.isDirectory()) {
    const childFilePaths = await fsPromises.readdir(filePath);
    await Promise.all(
      childFilePaths.map((childFilePath) => (
        rm(path.resolve(filePath, childFilePath))
      ))
    );
    await fsPromises.rmdir(filePath);
    return;
  }
}

export function getHashFromRoot (
  root: string
) {
  const hash = createHash('md5');
  hash.update(root);
  return `s_${hash.digest('hex')}`;
}

export function asyncGetDirHash (
  dirPath: string
) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha1');

    const dir = fs.opendirSync(dirPath);
    console.log(dir);
    reject()
    // const readStream = fs.createReadStream(dirPath)
    // readStream.on('data', (data) => {
    //   hash.update(data)
    // })
    // readStream.on('end', () => {
    //   resolve(hash.digest('hex'));
    // })
  })
}
