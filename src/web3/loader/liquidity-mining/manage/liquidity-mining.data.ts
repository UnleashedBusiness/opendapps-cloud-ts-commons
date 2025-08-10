
import { DefaultEVMNativeTokenDecimalSize, EmptyAddress } from '@unleashed-business/ts-web3-commons';
import { DeployLiquidityMiningData } from '../deploy/deploy-liquidity-mining.data.js';
import type { StakingRewardToken } from '../../staking/manage/staking-manage.data.js';
import { BigNumber } from 'bignumber.js';


export class LiquidityMiningData extends DeployLiquidityMiningData {
  public address: string | undefined = undefined;
  public isUpgradeable = false;

  public token: LiquidityMiningTokenData = new LiquidityMiningTokenData();
  public tokenTokenomicsAddress: string = EmptyAddress;

  public dexList: LiquidityMiningDexData[] = [];

  public predefinedPairingTokens: { address: string, name: string }[] = [];

  public owner: string = '';

  public stakingCommonAddress: string = EmptyAddress;
  public stakingCommonRewardsTokens: StakingRewardToken[] = [];
  public stakingCommonBlocksPerPayout: number = 1;
  public stakingRewardsMultipliersScaling: number = 10 ** 3;

  public get visibleRewardsTokens(): StakingRewardToken[] {
    return this.stakingCommonRewardsTokens.filter(x => x.ticker !== 'LMSP');
  }

  public get hasStaking(): boolean {
    return this.stakingCommonAddress !== EmptyAddress
      && this.stakingCommonAddress !== ''
      && this.stakingCommonAddress !== null
      && this.stakingCommonAddress !== undefined;
  }

  public get totalMultiplierValue(): number {
    return this.dexList.map(x => x.pools)
      .flat()
      .map(x => x.pairTokenPerToken() * x.stakinMultiplier)
      .reduce((x, y) => x + y, 0);
  }
}

export class LiquidityMiningDexData {
  public dexAddress: string = '';

  public pools: LiquidityMiningPoolData[] = [];
}

export class LiquidityMiningPoolData {
  public pairedToken: LiquidityMiningTokenData = new LiquidityMiningTokenData();
  public pairAddress: string = '';

  public pairTokenSupply: BigNumber = new BigNumber(0);
  public tokenAmount: BigNumber = new BigNumber(0);
  public pairedTokenAmount: BigNumber = new BigNumber(0);
  public connectedWalletPairBalance: BigNumber = new BigNumber(0);

  public tokenomicsEnabled: boolean = true;
  public stakinMultiplier: number = 1;

  public pairTokenPerToken(): number {
    return this.pairTokenSupply.dividedBy(this.tokenAmount).toNumber();
  }
}

export class LiquidityMiningTokenData {
  public address: string = '';
  public name: string = '';
  public ticker: string = '';
  public decimals: number = DefaultEVMNativeTokenDecimalSize;
  public totalSupply: BigNumber = new BigNumber(0);

  public get scaling(): number {
    return 10 ** this.decimals;
  }
}
