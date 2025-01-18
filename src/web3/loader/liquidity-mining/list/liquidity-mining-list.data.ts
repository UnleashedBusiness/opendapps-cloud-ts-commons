import { EventEmitter } from "@unleashed-business/ts-web3-commons";

export class LiquidityMiningDataForList {
  public address: string = '';

  public tokenAddress: string = '';
  public tokenName: string = '';
  public owner: string = '';
  public ownerName: string = '';
  public deployedOn: Date = new Date();

  public imageUrl?: string;
  public imageLoading = false;

  public readonly imageAvailableEvent: EventEmitter<string> = new EventEmitter<string>();
}

export class LiquidityMiningListData {
  public list: LiquidityMiningDataForList[] = [];
}
