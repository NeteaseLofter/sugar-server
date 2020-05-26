export class ServerError extends Error {
  name = 'ServerError';
  code: number;

  constructor (code: number, message: string) {
    super(message);

    this.code = code;
  }
}