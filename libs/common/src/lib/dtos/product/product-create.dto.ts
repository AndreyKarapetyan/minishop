import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { IsMultipleOfFive } from '../../validation-decorators/is-multiple-of-five';

export class ProductCreateDto {
  @IsInt()
  @IsPositive()
  amountAvailable: number;

  @IsMultipleOfFive()
  cost: number;

  @IsString()
  @IsNotEmpty()
  productName: string;
}
