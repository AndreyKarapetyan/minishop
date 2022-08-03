import { IsValidCoin } from '../validation-decorators/is-valid-coin';

export class DepositDto {
  @IsValidCoin()
  deposit: number;
}
