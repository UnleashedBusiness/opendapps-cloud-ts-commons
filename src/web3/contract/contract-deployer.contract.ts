import {ContractDeployerAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {BaseDeployerContract} from "./base/base-deployer.contract";
import {
  Erc20TokenContract,
  TransactionRunningHelperService,
  WalletConnectionService
} from "@unleashed-business/ts-web3-commons";

export class ContractDeployerContract extends BaseDeployerContract {
  constructor(tokenService: Erc20TokenContract, walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
    super(tokenService, walletConnection, transactionHelper);
  }

  protected getAbi(): typeof ContractDeployerAbi {
    return ContractDeployerAbi;
  }
}
