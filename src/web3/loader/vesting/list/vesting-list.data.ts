import { BigNumber } from 'bignumber.js';


export class VestingDataForList {
  public address: string = '';
  public participants: string[] = [];
  public tokens: string[] = [];
  public totalValueLocked: BigNumber = new BigNumber(0);

  public owner: string = '';
  public ownerName: string = '';
  public deployedOn: Date = new Date();
}

export class VestingListData {
  public vestingList: VestingDataForList[] = [];
}
