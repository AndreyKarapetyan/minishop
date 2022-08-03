import { registerDecorator, ValidationOptions } from 'class-validator';
import { COINS } from '../types';

export function IsValidCoin(property?: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCoin',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: 'You may put only 5, 10, 20, 50 or 100 cents',
        ...validationOptions
      },
      validator: {
        validate(value: unknown) {
          return value && typeof value === 'number' && Object.values(COINS).includes(value);
        },
      },
    });
  };
}
