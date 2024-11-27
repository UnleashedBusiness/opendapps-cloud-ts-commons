import {BigNumber} from "bignumber.js";
import {DefaultEVMNativeTokenDecimalSize} from "@unleashed-business/ts-web3-commons";

export class TreasuryDeployData {
  public deployTaxGeneral = new BigNumber(0);
  public deployTaxDecimals = DefaultEVMNativeTokenDecimalSize;

  public serviceTax = new BigNumber(0);
  public serviceTaxScaling = 0;
}
