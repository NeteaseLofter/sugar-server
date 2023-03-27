import inquirer from 'inquirer';


const optionsMap = new Map([
  ['template', {
    type: 'list',
    message: 'select a template for the created project',
    default: 'react',
    choices: [
      'base',
      'react'
    ]
  }],
  ['packageManager', {
    type: 'list',
    message: 'select a package manager for the created project',
    default: 'pnpm',
    choices: [
      'pnpm',
      'npm'
    ]
  }]
]);

export async function initOptionsByPrompt (defaultOptions: any = {}) {
  const answers = await inquirer
    .prompt(
      Array.from(optionsMap)
        .map(([key, prompt]) => {
          if (!defaultOptions[key]) {
            return {
              name: key,
              ...prompt
            }
          }
        })
        .filter((prompt) => !!prompt)
    )

  return {
    ...defaultOptions,
    ...answers
  };
}
