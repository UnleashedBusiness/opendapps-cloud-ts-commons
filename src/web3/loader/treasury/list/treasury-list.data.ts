import {BigNumber} from "bignumber.js";

export class TreasuryDataForList {
  public address: string = '';
  public nativeBalance: BigNumber = new BigNumber(0);
  public nativeBalanceDecimals = 0;
  public totalValueLocked: BigNumber = new BigNumber(0);
  public totalValueDecimals = 0;

  public owner: string = '';
  public ownerName: string = '';
  public deployedOn: Date = new Date();
}

export class TreasuryListData {
  public treasuries: TreasuryDataForList[] = [];
}
