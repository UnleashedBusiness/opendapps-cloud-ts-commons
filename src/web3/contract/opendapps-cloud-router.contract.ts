import {
  BaseMultiChainContract,
  BlockchainDefinition,
  ReadOnlyWeb3Connection,
  TransactionRunningHelperService,
} from "@unleashed-business/ts-web3-commons";
import { Web3BatchRequest } from "web3-core";
import { OpenDAppsCloudRouterAbi } from "@unleashed-business/opendapps-cloud-ts-abi/dist/abi/opendapps-cloud-router.abi";

export class OpenDAppsCloudRouterContract extends BaseMultiChainContract {
  private propertyValueCache: Map<string, any> = new Map<string, any>();

  constructor(
    web3Connection: ReadOnlyWeb3Connection,
    transactionHelper: TransactionRunningHelperService,
  ) {
    super(web3Connection, transactionHelper);
  }

  protected getAbi(): typeof OpenDAppsCloudRouterAbi {
    return OpenDAppsCloudRouterAbi;
  }

  public async proxyAdmin(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "proxyAdmin",
      batch,
      callback,
    );
  }

  public async referralsEngine(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "referralsEngine",
      batch,
      callback,
    );
  }

  public async contractDeployer(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "contractDeployer",
      batch,
      callback,
    );
  }

  public async tokenAsAServiceDeployer(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "tokenAsAServiceDeployer",
      batch,
      callback,
    );
  }

  public async decentralizedEntityDeployer(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "decentralizedEntityDeployer",
      batch,
      callback,
    );
  }

  public async stakingAsAServiceDeployer(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "stakingAsAServiceDeployer",
      batch,
      callback,
    );
  }

  public async assetBackingDeployer(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      "assetBackingDeployer",
      batch,
      callback,
    );
  }

  protected async getPropertyMulti<T>(
    config: BlockchainDefinition,
    contractAddress: string,
    propertyName: string,
    batch?: Web3BatchRequest,
    callback?: (result: T) => void,
  ): Promise<void | T> {
    const cacheKey = `${config.network}_${contractAddress}_${propertyName}`;
    if (!this.propertyValueCache.has(cacheKey))
      this.propertyValueCache.set(cacheKey, (await super.getPropertyMulti(config, contractAddress, propertyName)) as T);

    if (callback) {
      callback(this.propertyValueCache.get(cacheKey) as T);
      return;
    } else
      return this.propertyValueCache.get(cacheKey) as T;
  }
}
