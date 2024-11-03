import { DefaultEVMNativeTokenDecimalSize } from '@unleashed-business/ts-web3-commons';
import { BigNumber } from 'bignumber.js';
import { bn_wrap } from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import Web3 from 'web3';


export class VestingData {
  public address: string = '';

  public isUpgradeable = false;

  public owner: string = '';

  public percentScaling: number = 0;
  public version: number = 0;
  public cycles: number = 0;
  public cycleLength: BigNumber = new BigNumber(0);
  public activateHeight: BigNumber = new BigNumber(0);
  public finalReleaseHeight: BigNumber = new BigNumber(0);

  public tokens: VestingToken[] = [];
  public payees: VestingPayee[] = [];
  public controllers: VestingPayee[] = [];

  public ownedPlatformTokens: { address: string, name: string, owner: string }[] = [];

  public currentCycle(height: BigNumber): number {
    return height.minus(this.activateHeight).dividedToIntegerBy(this.cycleLength).plus(1).toNumber();
  }

  public nextUnlock(height: BigNumber): BigNumber {
    if (this.finalReleaseHeight.lt(height)) {
      return bn_wrap(0);
    } else {
      return this.activateHeight.plus(this.cycleLength.multipliedBy(this.currentCycle(height))).minus(height);
    }
  }

  public get serviceFeePercent(): number {
    return this.controllers.map(x => x.percent).reduce((p, c) => p + c, 0);
  }

  public filterPayee(address: string): VestingPayee | undefined {
    return this.payees.filter(x => Web3.utils.toChecksumAddress(x.address) === Web3.utils.toChecksumAddress(address)).pop();
  }
}

export class VestingPayee {
  public address: string = '';
  public percent: number = 0;
  public tokens: Record<string, VestingPayeeToken> = {};
}

export class VestingPayeeToken {
  public total: BigNumber = new BigNumber(0);
  public available: BigNumber = new BigNumber(0);
  public remaining: BigNumber = new BigNumber(0);
  public perCycle: BigNumber = new BigNumber(0);
}

export class VestingToken {
  public address: string = '';
  public name: string = '';
  public symbol: string = '';
  public decimals: number = DefaultEVMNativeTokenDecimalSize;

  public total: BigNumber = new BigNumber(0);
  public available: BigNumber = new BigNumber(0);
  public remaining: BigNumber = new BigNumber(0);
  public perCycle: BigNumber = new BigNumber(0);
}
