import { DecentralizedEntityInterfaceContract } from './decentralized-entity-interface.contract';
import { SingleOwnerEntityAbi, SingleOwnerEntityAbiFunctional } from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BlockchainDefinition,
} from '@unleashed-business/ts-web3-commons';
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';
import { NumericResult } from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract.types';
import { Web3BatchRequest } from 'web3-core';

export class SingleOwnerEntityContract extends DecentralizedEntityInterfaceContract<SingleOwnerEntityAbiFunctional> {
  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected override getAbi(): any {
    return SingleOwnerEntityAbi;
  }

  public async ownershipTokenId(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      entityAddress,
      'ownershipTokenId',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async ownershipCollection(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(config, entityAddress, 'ownershipCollection', batch, callback);
  }

  public async isOwner(
    config: BlockchainDefinition,
    entityAddress: string,
    wallet: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(config, entityAddress, (contract) => contract.methods.isOwner(wallet), batch, callback);
  }
}
