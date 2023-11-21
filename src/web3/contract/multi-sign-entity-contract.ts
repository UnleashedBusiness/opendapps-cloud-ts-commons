import { DecentralizedEntityInterfaceContract } from './decentralized-entity-interface.contract';
import { MultiSignEntityAbi, MultiSignEntityAbiFunctional } from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BlockchainDefinition,
} from '@unleashed-business/ts-web3-commons';
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';
import { NumericResult } from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract.types';
import { Web3BatchRequest } from 'web3-core';

export class MultiSignEntityContract extends DecentralizedEntityInterfaceContract<MultiSignEntityAbiFunctional> {
  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected override getAbi(): any {
    return MultiSignEntityAbi;
  }

  public async requiredRootSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      entityAddress,
      'requiredRootSignatures',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async requiredTotalSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      entityAddress,
      'requiredTotalSignatures',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async availableRootSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      entityAddress,
      'availableRootSignatures',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async availableTotalSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      entityAddress,
      'availableTotalSignatures',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async currentRootSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    proposal: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      async (contract) => contract.methods.currentRootSignatures(proposal),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async currentTotalSignatures(
    config: BlockchainDefinition,
    entityAddress: string,
    proposal: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      entityAddress,
      async (contract) => contract.methods.currentTotalSignatures(proposal),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
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
      async (contract) => contract.methods.hasVoted(proposal, address),
      batch,
      callback,
    );
  }

  public getPromoteRootData(entityAddress: string, address: string): Promise<string> {
    return this.getRunMethodDataMulti(entityAddress, (contract) => contract.methods.promoteRoot(address));
  }

  public getPromoteLeafData(entityAddress: string, address: string): Promise<string> {
    return this.getRunMethodDataMulti(entityAddress, (contract) => contract.methods.promoteLeaf(address));
  }

  public getDemoteRootData(entityAddress: string, address: string): Promise<string> {
    return this.getRunMethodDataMulti(entityAddress, (contract) => contract.methods.demoteRoot(address));
  }

  public getDemoteLeafData(entityAddress: string, address: string): Promise<string> {
    return this.getRunMethodDataMulti(entityAddress, (contract) => contract.methods.demoteLeaf(address));
  }
}
