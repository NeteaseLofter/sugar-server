import path from 'path';

import {
  searchFiles,
  findParentFile,
  loadJSON
} from '../shared/file-helpers';

export async function loadAllDllModulesManifest (
  dir: string,
  exclude?: string
): Promise<{
  context: string;
  manifest: {
    name: string;
    content: any;
  };
  moduleName: string;
  name: string;
  assets: string[]
}[]> {
  const moduleFilePaths = await searchFiles(
    dir,
    'dll.modules.manifest.json',
    exclude
  );

  const modules = await Promise.all(
    moduleFilePaths.map(async (moduleFilePath) => {
      const moduleConfigFilePath = await findParentFile(
        moduleFilePath,
        'manifest.json'
      );
      if (!moduleConfigFilePath) {
        throw new Error(`not find manifest.json for ${moduleFilePath}`)
      }
      const moduleConfig = await loadJSON(moduleConfigFilePath);
      const module = await loadJSON(moduleFilePath);
      const name = module.name.split('_sn_').slice(1).join('_sn_');
      return {
        context: moduleConfig.context,
        manifest: module,
        moduleName: module.name,
        name,
        assets: moduleConfig.entries[name]
      }
    })
  )

  return modules.filter((module) => !!module) as {
    context: string;
    manifest: {
      name: string;
      content: any;
    };
    moduleName: string;
    name: string;
    assets: string[]
  }[];
}

export async function loadBaseManifest (
  dir: string
) {
  return loadJSON(
    path.resolve(
      dir,
      './manifest.json'
    )
  );
}
