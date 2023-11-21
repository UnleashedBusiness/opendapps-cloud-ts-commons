import { DecentralizedEntityInterfaceContract } from './decentralized-entity-interface.contract';
import {
  MultiSignSharesEntityAbi,
  MultiSignSharesEntityAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BlockchainDefinition,
} from '@unleashed-business/ts-web3-commons';
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';
import { NumericResult } from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract.types';
import { Web3BatchRequest } from 'web3-core';

export class MultiSignSharesEntityContract extends DecentralizedEntityInterfaceContract<MultiSignSharesEntityAbiFunctional> {
  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected override getAbi(): any {
    return MultiSignSharesEntityAbi;
  }

  public async hasVoted(
    config: BlockchainDefinition,
    entityAddress: string,
    proposal: string,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      (contract) => contract.methods.hasVoted(proposal, address),
      batch,
      callback,
    );
  }

  public async ownershipCollection(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      (contract) => contract.methods.ownershipCollection(),
      batch,
      callback,
    );
  }

  public async ownershipTokenId(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(config, entityAddress, (contract) => contract.methods.ownershipTokenId(), batch, callback);
  }

  public async requiredSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    proposal: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      (contract) => contract.methods.requiredSignatures(proposal),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async currentSharesSigned(
    config: BlockchainDefinition,
    entityAddress: string,
    proposal: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      (contract) => contract.methods.currentSharesSigned(proposal),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }
}
