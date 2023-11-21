import {
  DecentralizedEntityInterfaceAbi,
  DecentralizedEntityInterfaceAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseMultiChainContract,
  BlockchainDefinition,
} from '@unleashed-business/ts-web3-commons';
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';
import { Web3BatchRequest } from 'web3-core';

export class DecentralizedEntityInterfaceContract<
  FunctionalAbi extends DecentralizedEntityInterfaceAbiFunctional = DecentralizedEntityInterfaceAbiFunctional,
> extends BaseMultiChainContract<FunctionalAbi> {
  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected getAbi(): typeof DecentralizedEntityInterfaceAbi {
    return DecentralizedEntityInterfaceAbi;
  }

  public async name(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(config, entityAddress, async (contract) => contract.methods.name(), batch, callback);
  }

  public async metadataUrl(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      async (contract) => contract.methods.metadataUrl(),
      batch,
      callback,
    );
  }

  public async memberOf(
    config: BlockchainDefinition,
    entityAddress: string,
    wallet: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      async (contract) => contract.methods.memberOf(wallet),
      batch,
      callback,
    );
  }
}
