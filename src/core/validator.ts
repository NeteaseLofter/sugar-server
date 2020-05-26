import 'reflect-metadata';

import createThunkAttributeDescriptor from '../shared/create-thunk-attribute-descriptor';

const parameterValidateMetadataKey = Symbol('paramterValidate');

export const required = createParamterValidate((value, parameterIndex) => {
  if (!value) {
    throw new Error(`param ${parameterIndex} ${value} is required`);
  }
})

export const string = createParamterValidate((value, parameterIndex) => {
  if (typeof value !== 'string') {
    throw new Error(`param ${parameterIndex} ${value} not string`);
  }
})

export const number = createParamterValidate((value, parameterIndex) => {
  if (typeof value !== 'number') {
    throw new Error(`param ${parameterIndex} ${value} not number`);
  }
})


export function validate (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value;
  descriptor.value = function () {
    let existingParameterValidator: ParameterValidator[] = Reflect.getOwnMetadata(parameterValidateMetadataKey, target, propertyName);
    if (existingParameterValidator) {
      for (let parameterValidator of existingParameterValidator) {
        parameterValidator.validator(
          arguments[parameterValidator.index],
          parameterValidator.index
        )
      }
    }

    return method && method.apply(this, arguments);
  }
}

export const validated = createThunkAttributeDescriptor<ParamterValidate[]>((
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

export function createParamterValidate (validateCallback: ValidateCallback) {
  return function paramterValidate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingParameterValidator: ParameterValidator[] = Reflect.getOwnMetadata(parameterValidateMetadataKey, target, propertyKey) || [];
    existingParameterValidator.push({
      index: parameterIndex,
      validator: validateCallback
    })
    Reflect.defineMetadata(parameterValidateMetadataKey, existingParameterValidator, target, propertyKey);
  }
}

interface ParamterValidate {
  (target: Object, propertyKey: string | symbol, parameterIndex: number): void;
}
interface ValidateCallback {
  (value: any, parameterIndex: number): void
}

interface ParameterValidator {
  index: number,
  validator: ValidateCallback
}
