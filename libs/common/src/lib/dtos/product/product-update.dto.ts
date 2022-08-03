import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { IsMultipleOfFive } from '../../validation-decorators/is-multiple-of-five';

export class ProductUpdateDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  amountAvailable?: number;

  @IsOptional()
  @IsMultipleOfFive()
  cost?: number;

  @IsString()
  @IsOptional()
  productName?: string;
}
