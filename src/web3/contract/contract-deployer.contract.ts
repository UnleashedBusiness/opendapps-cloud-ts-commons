import {ContractDeployerAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {BaseDeployerContract} from "./base/base-deployer.contract";
import {
  Erc20TokenContract, ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";

export class ContractDeployerContract extends BaseDeployerContract {


  constructor(token: Erc20TokenContract, web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
    super(token, web3Connection, transactionHelper);
  }

  protected getAbi(): typeof ContractDeployerAbi {
    return ContractDeployerAbi;
  }
}
