import {BigNumber} from "bignumber.js";

export class StakingDataForList {
    public address: string = '';
    public tokenAddress: string = '';
    public tokenName: string = '';
    public tokenSymbol: string = '';
    public tokenDecimals: number = 18;
    public tokenSupply: BigNumber = new BigNumber(0);
    public totalStaked: BigNumber = new BigNumber(0);

    public owner: string = '';
    public ownerName: string = '';
    public deployedOn: Date = new Date();

    public imageUrl?: string;
}

export class StakingListData {
    public stakingPools: StakingDataForList[] = [];
}
