import { BigNumber } from 'bignumber.js';

export class DeployLiquidityMiningData {
  public ownedPlatformTokens: {address: string, name: string, owner: string}[] = [];

  public deployTax = new BigNumber(0);
  public serviceTax = new BigNumber(0);
}
