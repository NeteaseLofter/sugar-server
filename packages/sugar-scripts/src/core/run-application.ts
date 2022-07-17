import {
  Application
} from 'sugar-server';

export const runApplication = (
  ApplicationClass: typeof Application,
  port: number
) => {
  const app = new ApplicationClass();

  app.listen(port)
}