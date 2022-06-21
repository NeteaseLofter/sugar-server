import 'reflect-metadata';

import { ControllerContext } from './application';
import createThunkAttributeDescriptor from '../shared/create-thunk-attribute-descriptor';
import { SugarServerError } from './error';

const parameterValidateMetadataKey = Symbol('parameterValidate');

export const required = createParameterValidate((value, parameterIndex) => {
  if (!value) {
    throw new SugarServerError(
      400,
      `param [${parameterIndex}] is required`,
      {
        statusCode: 400
      }
    );
  }
})

export const string = createParameterValidate((value, parameterIndex) => {
  if (typeof value !== 'string') {
    throw new SugarServerError(
      400,
      `param [${parameterIndex}] ${value} not string`,
      {
        statusCode: 400
      }
    );
  }
})

export const number = createParameterValidate((value, parameterIndex) => {
  if (typeof value !== 'number') {
    throw new SugarServerError(
      400,
      `param [${parameterIndex}] ${value} not number`,
      {
        statusCode: 400
      }
    );
  }
})

export const array = (
  itemExtraCheck: ValidateCallback|ParameterValidate
) => createParameterValidate(async (value, parameterIndex, ctx) => {
  if (!Array.isArray(value)) {
    throw new SugarServerError(
      400,
      `param [${parameterIndex}] ${value} not array`,
      {
        statusCode: 400
      }
    );
  }
  if (itemExtraCheck) {
    let itemValidateCallback: ValidateCallback;
    if (
      isParameterValidate(itemExtraCheck)
    ) {
      itemValidateCallback = itemExtraCheck.validateCallback;
    } else {
      itemValidateCallback = itemExtraCheck;
    }
    for (let i = 0; i < value.length; i++) {
      let itemValue = value[i];
      await itemValidateCallback(itemValue, `${parameterIndex}-${i}`, ctx);
    }
  }
})

function isParameterValidate (obj: ValidateCallback|ParameterValidate): obj is ParameterValidate {
  return !!(obj as ParameterValidate).validateCallback;
}


export function validate (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  let method = descriptor.value;
  descriptor.value = async function () {
    // 通过parameterGetter处理后，最后2个参数是 ctx、next
    const ctx = arguments[arguments.length - 2];
    let existingParameterValidator: ParameterValidator[] = Reflect.getOwnMetadata(parameterValidateMetadataKey, target, propertyName);
    if (existingParameterValidator) {
      for (let parameterValidator of existingParameterValidator) {
        await parameterValidator.validator(
          arguments[parameterValidator.index],
          parameterValidator.index,
          ctx
        )
      }
    }

    return method && method.apply(this, arguments);
  }
}

export const validated = createThunkAttributeDescriptor<ParameterValidate[]>((
  validators,
  target,
  key,
  descriptor
) => {
  let value = descriptor.value;
  if (typeof value === 'function') {
    for (let i = 0; i < validators.length; i++) {
      let parameterValidator = validators[i];
      if (Array.isArray(parameterValidator)) {
        parameterValidator.forEach((item: any) => {
          item(target, key, i);
        })
      } else {
        parameterValidator(target, key, i);
      }
    }
    return validate(target, key, descriptor);
  }
})

export function createParameterValidate (validateCallback: ValidateCallback) {
  function parameterValidate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingParameterValidator: ParameterValidator[] = Reflect.getOwnMetadata(parameterValidateMetadataKey, target, propertyKey) || [];
    existingParameterValidator.push({
      index: parameterIndex,
      validator: validateCallback
    })
    Reflect.defineMetadata(parameterValidateMetadataKey, existingParameterValidator, target, propertyKey);
  }
  parameterValidate.validateCallback = validateCallback;
  return parameterValidate;
}

export interface ParameterValidate {
  (target: Object, propertyKey: string | symbol, parameterIndex: number): void;
  validateCallback: ValidateCallback
}
export interface ValidateCallback {
  (value: any, parameterIndex: number|string, ctx: ControllerContext): void
}

export interface ParameterValidator {
  index: number,
  validator: ValidateCallback
}
