import { ContractDeployerAbi, ContractDeployerAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseTokenAwareContract,
  BlockchainDefinition, EmptyAddress,
  Erc20TokenContract,
} from "@unleashed-business/ts-web3-commons";
import { Web3BatchRequest } from "web3-core";
import BigNumber from "bignumber.js";
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';

export class ContractDeployerContract extends BaseTokenAwareContract<ContractDeployerAbiFunctional> {
  constructor(token: Erc20TokenContract, toolkit: ContractToolkitService) {
    super(token, toolkit);
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
