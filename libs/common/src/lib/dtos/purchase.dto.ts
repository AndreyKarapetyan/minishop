import { IsInt, IsPositive } from 'class-validator';

export class PurchaseDto {
  @IsPositive()
  @IsInt()
  productId: number;

  @IsPositive()
  @IsInt()
  amount: number;
}
