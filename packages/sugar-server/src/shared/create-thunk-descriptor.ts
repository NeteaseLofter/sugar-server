export function createThunkAttributeDecorator<
  OptionsType
> (
  callback: ThunkAttributeDecorator<OptionsType>
) {
  return function (
    options: OptionsType
  ) {
    return function (
      target: any,
      key: string,
      descriptor?: PropertyDescriptor
    ): any {
      return mixinDescriptor<OptionsType>(
        callback, options, target, key, descriptor
      );
    }
  }
}

export function createThunkClassDecorator<
  OptionsType
> (
  callback: ThunkClassDecorator<OptionsType>
) {
  return function (
    options: OptionsType
  ) {
    return function (
      target: any
    ): any {
      return callback(
        options, target
      );
    }
  }
}

function mixinDescriptor<OptionsType> (
  callback: ThunkAttributeDecorator<OptionsType>,
  options: OptionsType,
  target: any,
  key: string,
  descriptor?: PropertyDescriptor
) {
  if (!descriptor) {
    descriptor = Object.create(null) as PropertyDescriptor;
  }


  const newValue = callback.call(
    target,
    options,
    target,
    key,
    descriptor
  )

  if (typeof newValue !== 'undefined') {
    descriptor.value = newValue;
  }

  return descriptor;
}

interface ThunkAttributeDecorator<OptionsType> {
  (
    options: OptionsType,
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ): void;
}

interface ThunkClassDecorator<OptionsType> {
  (
    options: OptionsType,
    target: any
  ): void;
}