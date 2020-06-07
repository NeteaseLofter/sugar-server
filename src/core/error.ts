export class SugarServerError extends Error {
  name = 'SugarServerError';
  code: number;

  constructor (code: number, message: string) {
    super(message);

    this.code = code;
  }
}