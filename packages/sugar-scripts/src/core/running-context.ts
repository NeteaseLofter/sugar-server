import { createHash } from 'crypto';
import path from 'path';

type BuildEntry = { [key: string]: string|string[] };

interface PackageConfig {
  browser?: {
    /**
     * 是否构建dll用的输出
     */
    dll?: boolean;
    /**
     * 输出目录
     */
    output: string;
    /**
     * controller/index
     */
    input?: string;
    entry?: BuildEntry
  };

  server?: {
    dll?: boolean;
    output: string;
    entry: string;
    render?: string;
  };
}

interface ProjectConfig {
  cacheDir: string;
}

export function getHashFromRoot (
  root: string
) {
  const hash = createHash('md5');
  hash.update(root);
  return `s_${hash.digest('hex')}`;
}

export class SugarScriptsContext {
  root: string;
  rootHash: string;
  packageName: string;
  packageConfig: PackageConfig;
  projectRoot: string;
  projectConfig: ProjectConfig;

  constructor (
    {
      root,
      packageName,
      packageConfig,
      projectRoot,
      projectConfig
    }: {
      root: string;
      packageName: string;
      packageConfig: PackageConfig;
      projectRoot: string;
      projectConfig: ProjectConfig;
    }
  ) {
    this.root = root;
    this.packageName = packageName;
    this.packageConfig = packageConfig;
    this.projectRoot = projectRoot;
    this.projectConfig = projectConfig;
    this.rootHash = getHashFromRoot(root);
  }

  serverEntryName = 'main';

  getStartFilePath () {
    if (this.packageConfig.server) {
      return path.resolve(
        this.root,
        this.packageConfig.server.output,
        this.serverEntryName
      )
    }
  }

  getCacheDir () {
    return path.resolve(
      this.projectRoot,
      this.projectConfig.cacheDir
    )
  }
}