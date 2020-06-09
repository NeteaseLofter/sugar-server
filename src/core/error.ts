export class SugarServerError extends Error {
  name = 'SugarServerError';
  code: number;
  statusCode?: number;

  constructor (code: number, message: string, {
    statusCode
  }: {
    statusCode?: number
  } = {}) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
  }
}