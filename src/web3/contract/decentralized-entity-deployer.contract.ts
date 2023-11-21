import Web3 from 'web3';
import {
  DecentralizedEntityDeployerAbi,
  DecentralizedEntityDeployerAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseMultiChainContract,
  BlockchainDefinition,
  ContractToolkitService,
  MethodRunnable,
} from '@unleashed-business/ts-web3-commons';
import { Web3BatchRequest } from 'web3-core';

export class DecentralizedEntityDeployerContract extends BaseMultiChainContract<DecentralizedEntityDeployerAbiFunctional> {
  public static readonly GROUP_DECENTRALIZED_COMPANY = Web3.utils.soliditySha3('DecentralizedCompany')!!;

  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected getAbi(): typeof DecentralizedEntityDeployerAbi {
    return DecentralizedEntityDeployerAbi;
  }

  public async singleOwnerNFTOwnershipContract(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'singleOwnerNFTOwnershipContract', batch, callback);
  }

  public async sharesEntityNftOwnershipContract(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'sharesEntityNftOwnershipContract', batch, callback);
  }

  public async deploySingleOwnerEntity(contractAddress: string, entityName: string, metadataUrl: string) {
    return this.buildMethodRunnableMulti(contractAddress, async (contract) =>
      contract.methods.deploySingleOwnerEntity(entityName, metadataUrl),
    );
  }

  public async deployMultiSignEntity(
    contractAddress: string,
    entityName: string,
    votingBlocksLength: number,
    metadataUrl: string,
  ) {
    return this.buildMethodRunnableMulti(contractAddress, async (contract) =>
      contract.methods.deployMultiSignEntity(entityName, votingBlocksLength, metadataUrl),
    );
  }

  public async deployMultiSignSharesEntity(
    contractAddress: string,
    entityName: string,
    votingBlocksLength: number,
    metadataUrl: string,
  ) {
    return this.buildMethodRunnableMulti(contractAddress, async (contract) =>
      contract.methods.deployMultiSignSharesEntity(entityName, votingBlocksLength, metadataUrl),
    );
  }

  public upgradeTreasury(contractAddress: string, treasury: string): MethodRunnable {
    return this.buildMethodRunnableMulti(contractAddress, async (contract, connectedAddress) =>
      contract.methods.upgradeTreasury(treasury),
    );
  }
}
