import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsMultipleOfFive(property?: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: 'cost must be multiple of five',
        ...validationOptions
      },
      validator: {
        validate(value: unknown) {
          return value && typeof value === 'number' && value % 5 === 0;
        },
      },
    });
  };
}
