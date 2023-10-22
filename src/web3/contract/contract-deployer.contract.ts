import { ContractDeployerAbi, ContractDeployerAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseTokenAwareContract,
  BlockchainDefinition, EmptyAddress,
  Erc20TokenContract, ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import { Web3BatchRequest } from "web3-core";
import BigNumber from "bignumber.js";

export class ContractDeployerContract extends BaseTokenAwareContract<ContractDeployerAbiFunctional> {

  constructor(token: Erc20TokenContract, web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
    super(token, web3Connection, transactionHelper);
  }

  protected getAbi(): typeof ContractDeployerAbi {
    return ContractDeployerAbi;
  }

  public async isUpgradeable(
    config: BlockchainDefinition,
    contractAddress: string,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void
  ) {
    return this.getViewMulti(config, contractAddress, async (contract) => contract.methods.isUpgradeable(address), batch, callback);
  }

  public async deployTaxForAddress(
    config: BlockchainDefinition,
    contractAddress: string,
    address: string,
    group: string,
    type: number,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      async contract => contract.methods.deployTaxForAddress(address, group, type), EmptyAddress, batch, callback);
  }
}
