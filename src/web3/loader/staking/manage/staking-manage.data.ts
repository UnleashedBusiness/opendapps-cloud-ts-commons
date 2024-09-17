import {BigNumber} from "bignumber.js";
import {StakingDeployData} from "../deploy/staking-deploy.data.js";
import {TokenExtendedInformation} from "../../shared/token-information.js";

export class StakingManageData extends StakingDeployData {
    public address?: string = undefined;
    public isUpgradeable = false;

    public stakingToken: TokenExtendedInformation = new TokenExtendedInformation();
    public owner: string = '';

    public currentEpoch = 0;
    public lastStateChangeEpoch = 0;
    public blockDistanceBetweenEpochs = 0;
    public blockOfLastStateChangeEpochRaise = 0;

    public lockingEnabled = false;
    public minEpochLockLength = 0;
    public maxEpochLockLength = 0;
    public rewardMultiplierPerEpochLocked = new BigNumber(0);

    public externalRewardProviders: { name: string, address: string }[] = [];
    public rewardTokens: StakingRewardToken[] = [];

    public minStake: BigNumber = new BigNumber(0);
    public maxStake: BigNumber = new BigNumber(0);
}

export class StakingRewardToken extends TokenExtendedInformation {
    public totalAvailableRewards: BigNumber = new BigNumber(0)
    public rewardsForCurrentEpochIncrement: BigNumber = new BigNumber(0);
    public maxPerEpoch: BigNumber = new BigNumber(0);
}
