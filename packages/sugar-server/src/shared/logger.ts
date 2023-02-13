export const success = (message: string) => {
  console.log(`✓ ${message}`);
}

export const error = (message: string) => {
  console.log(`✘ ${message}`);
}

export const warn = (message: string) => {
  console.log(`⚠︎ ${message}`);
}

export const info = (message: string) => {
  console.log(`➤ ${message}`);
}

export const log = (message: string) => {
  console.log(message);
}
