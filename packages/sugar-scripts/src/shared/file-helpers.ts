import fs from 'fs';
import path from 'path';

import {
  SUGAR_PACKAGE_CONFIG_FILENAME
} from '../constants';
import {
  PackageConfig
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
  } catch (e) {}
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
  packageConfig: PackageConfig | null;
}> => {
  const packagePath = path.resolve(dir, 'package.json');

  let existed = true;
  try {
    await fsPromises.access(packagePath, fs.constants.F_OK);
  } catch (e) {
    existed = false;
  }

  let packageConfig = null;
  try {
    packageConfig = require(
      path.resolve(dir, SUGAR_PACKAGE_CONFIG_FILENAME)
    )
  } catch (e) {}

  if (existed) {
    return {
      root: dir,
      packageJson: require(
        packagePath
      ),
      packageConfig
    };
  }

  if (dir === '/') {
    throw new Error('not found package.json');
  }

  return findPackage(
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
