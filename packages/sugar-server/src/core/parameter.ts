import 'reflect-metadata';
import parse from 'co-body';

import type {
  Controller,
  ControllerContext
} from './controller';

const parameterGetterMetadataKey = Symbol('_parameterGetter');

export function getter (
  target: Controller,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<
    (this: Controller, ...args: any[]) => any
  >
) {
  let method = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const ctx: any = this.context;
    let existingParameterGetters: ParameterGetter[] = Reflect.getOwnMetadata(parameterGetterMetadataKey, target, propertyName);
    let gotValues = [];
    if (existingParameterGetters) {
      for (let parameterGetter of existingParameterGetters) {
        gotValues[
          parameterGetter.index
        ] = await parameterGetter.getter(ctx);
      }
    }

    return method && method.call(this, ...gotValues, ctx, ...args);
  }
}

export function createParameterGetter (getterCallback: GetterCallback) {
  return function parameterValidate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingParameterGetters: ParameterGetter[] = Reflect.getOwnMetadata(parameterGetterMetadataKey, target, propertyKey) || [];
    existingParameterGetters.push({
      index: parameterIndex,
      getter: getterCallback
    })

    Reflect.defineMetadata(parameterGetterMetadataKey, existingParameterGetters, target, propertyKey);
  }
}


export function config (configKey: string): ((target: Object, propertyKey: string | symbol, parameterIndex: number) => void);
export function config (configKey: Object, propertyKey: string | symbol, parameterIndex: number): void;
export function config (configKey: string|Object, propertyKey?: string | symbol, parameterIndex?: number) {
  if (typeof configKey === 'string') {
    return createParameterGetter((ctx: ControllerContext) => {
      return ctx.app.config.get(configKey)
    })
  } else if (typeof configKey === 'object' && propertyKey) {
    return createParameterGetter((ctx: ControllerContext) => {
      return ctx.app.config
    })(configKey, propertyKey, parameterIndex as number)
  }
}

export const Response = createParameterGetter((ctx) => {
  return ctx.response;
})
export const NodeResponse = createParameterGetter((ctx) => {
  return ctx.res;
})
export const Request = createParameterGetter((ctx) => {
  return ctx.request;
})
export const NodeRequest = createParameterGetter((ctx) => {
  return ctx.req;
})
export const Context = createParameterGetter((ctx) => {
  return ctx;
})

export const query = (key: string) => createParameterGetter((ctx) => {
  return ctx.query[key];
})

export const header = (key: string) => createParameterGetter((ctx) => {
  return ctx.headers[key];
})

export const params = (key: string) => createParameterGetter((ctx) => {
  return ctx.params[key];
})

export const body = (path?: string) => createParameterGetter(async (ctx) => {
  const parsedBodyJSON = await getParsedBody(
    ctx,
    () => (parse(ctx.req))
  );
  return findDataByPath(parsedBodyJSON, path);
})

export const bodyJSON = (path?: string) => createParameterGetter(async (ctx) => {
  const parsedBodyJSON = await getParsedBody(
    ctx,
    () => (parse.json(ctx.req))
  );
  return findDataByPath(parsedBodyJSON, path);
})

export const bodyFormData = (path?: string) => createParameterGetter(async (ctx) => {
  const parsedBodyJSON = await getParsedBody(
    ctx,
    () => (parse.form(ctx.req))
  );
  return findDataByPath(parsedBodyJSON, path);
})

export const bodyText = () => createParameterGetter((ctx) => {
  return parse.text(ctx.req)
})

function findDataByPath (data: any, path?: string) {
  let result = data;
  if (typeof path === 'string') {
    const pathArr = path.split('.');
    for (let i = 0;i < pathArr.length; i++) {
      result = result[pathArr[i]];
      if (
        typeof result === 'undefined'
        || result === null
      ) {
        break;
      }
    }
  }
  return result;
}

async function getParsedBody (ctx: ControllerContext, parseFn: any) {
  let parsedBodyJSON;
  if (ctx._parsedBodyJSON) {
    parsedBodyJSON = ctx._parsedBodyJSON;
  } else {
    parsedBodyJSON = await parseFn();
    ctx._parsedBodyJSON = parsedBodyJSON;
  }
  return parsedBodyJSON;
}

export const cookie: (
  (
    ...args: Parameters<ControllerContext['cookies']['get']>
  ) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void
) = (
  ...args: Parameters<ControllerContext['cookies']['get']>
) => createParameterGetter((ctx) => {
  return ctx.cookies.get(...args)
})

export interface GetterCallback {
  (ctx: ControllerContext): any
}

export interface ParameterGetter {
  index: number,
  getter: GetterCallback,
}
