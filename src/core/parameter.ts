import 'reflect-metadata';
import parse from 'co-body';

const parameterGetterMetadataKey = Symbol('_paramterGetter');

export function getter (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value;
  descriptor.value = async function (ctx: any, ...args) {
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

export function createParamterGetter (getterCallback: GetterCallback) {
  return function paramterValidate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingParameterGetters: ParameterGetter[] = Reflect.getOwnMetadata(parameterGetterMetadataKey, target, propertyKey) || [];
    existingParameterGetters.push({
      index: parameterIndex,
      getter: getterCallback
    })

    Reflect.defineMetadata(parameterGetterMetadataKey, existingParameterGetters, target, propertyKey);
  }
}

export const query = (key: string) => createParamterGetter((ctx) => {
  return ctx.query[key];
})

export const header = (key: string) => createParamterGetter((ctx) => {
  return ctx.headers[key];
})

export const params = (key: string) => createParamterGetter((ctx) => {
  return ctx.params[key];
})

export const body = () => createParamterGetter((ctx: any) => {
  return parse(ctx.req);
})

export const bodyJSON = () => createParamterGetter((ctx: any) => {
  return parse.json(ctx.req)
})

export const bodyFormData = () => createParamterGetter((ctx: any) => {
  return parse.form(ctx.req)
})

export const bodyText = () => createParamterGetter((ctx: any) => {
  return parse.text(ctx.req)
})

interface GetterCallback {
  (ctx: any): any
}

interface ParameterGetter {
  index: number,
  getter: GetterCallback
}