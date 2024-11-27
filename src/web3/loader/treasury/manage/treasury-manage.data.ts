import {BigNumber} from "bignumber.js";
import {DefaultEVMNativeTokenDecimalSize} from "@unleashed-business/ts-web3-commons";
import {TreasuryDeployData} from "../deploy/treasury-deploy.data.js";

export class TreasuryManageData extends TreasuryDeployData {
  public rewardTokens: RewardToken[] = [];
  public payees: RewardsPayee[] = [];
  public controller: string = '';
  public address: string = '';
  public owner: string = '';
  public connectedPocketOwners: RewardsPayee[] = [];
  public isUpgradeable: boolean = false;

  public percentScaling: number = 10;
}

export class PayeePocket {
  public address: string = '';
  public name: string = '';
  public owner: string = '';
  public percent: number = 0;
}

export class RewardsPayee {
  public pockets: PayeePocket[] = [];
  public owner: string = '';
  public name: string = '';
}

export class RewardToken {
  public address: string = '';
  public name: string = '';
  public ticker: string = '';
  public scaling: number = DefaultEVMNativeTokenDecimalSize;
  public balance: { pocket: string, amount: BigNumber }[] = [];

  public total: BigNumber = new BigNumber(0);
}
