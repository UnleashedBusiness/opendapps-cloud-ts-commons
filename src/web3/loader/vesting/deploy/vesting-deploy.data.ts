import { BigNumber } from 'bignumber.js';
import { DefaultEVMNativeTokenDecimalSize } from '@unleashed-business/ts-web3-commons';


export class VestingDeployData {
  public deployTaxGeneral = new BigNumber(0);
  public serviceTax = 0;
  public entities: { address: string, name: string }[] = [];
  public deployTaxDecimals = DefaultEVMNativeTokenDecimalSize;
}
