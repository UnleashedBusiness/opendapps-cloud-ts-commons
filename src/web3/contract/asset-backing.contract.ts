import { AssetBackingAbi, AssetBackingAbiFunctional } from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseTokenAwareContract,
  BlockchainDefinition,
  ContractToolkitService,
  Erc20TokenContract,
} from '@unleashed-business/ts-web3-commons';
import { Web3BatchRequest } from 'web3-core';
import BigNumber from 'bignumber.js';

export class AssetBackingContract extends BaseTokenAwareContract<AssetBackingAbiFunctional> {
  constructor(token: Erc20TokenContract, toolkit: ContractToolkitService) {
    super(token, toolkit);
  }

  protected override getAbi(): any {
    return AssetBackingAbi;
  }

  public async lockedUntil(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getPropertyMulti(
      config,
      address,
      (contract) => contract.methods.lockedUntil(),
      batch,
      callback,
    );
  }

  public async backingAmount(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backingToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backingToken(),
    )) as string;
    return this.getViewWithDivision(
      config,
      address,
      (contract) => contract.methods.backingAmount(),
      backingToken,
      batch,
      callback,
    );
  }

  public async smartBurnedAmount(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backedToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backedToken(),
    )) as string;
    return this.getViewWithDivision(config, address, (contract) => contract.methods.smartBurnedAmount(), backedToken, batch, callback);
  }

  public async backedTokenCirculatingSupply(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backedToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backedToken(),
    )) as string;
    return this.getViewWithDivision(
      config,
      address,
      (contract) => contract.methods.backedTokenCirculatingSupply(),
      backedToken,
      batch,
      callback,
    );
  }

  public async floorPriceScaled(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backingToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backingToken(),
    )) as string;
    return this.getViewWithDivision(config, address, (contract) => contract.methods.floorPrice(), backingToken, batch, callback);
  }

  public async flipFloorPriceScaled(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backedToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backedToken(),
    )) as string;
    return this.getViewWithDivision(config, address, (contract) => contract.methods.flipFloorPrice(), backedToken, batch, callback);
  }

  public async pendingBackingFromProviders(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const backingToken = (await this.getPropertyMulti(config, address, async (abi) =>
      abi.methods.backingToken(),
    )) as string;
    return this.getViewWithDivision(
      config,
      address,
      (contract) => contract.methods.pendingBackingFromProviders(),
      backingToken,
      batch,
      callback,
    );
  }

  public async burnContainersArray(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: string[]) => void,
  ) {
    return this.getViewMulti(config, address, (contract) => contract.methods.burnContainersArray(), batch, callback);
  }

  public setRewardsPullCooldown(address: string, rewardsPullCooldown: number) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.setRewardsPullCooldown(rewardsPullCooldown),
    );
  }

  public setRewardsPullThreshold(address: string, rewardsPullThreshold: number) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.setRewardsPullThreshold(rewardsPullThreshold),
    );
  }

  public addBurnContainer(address: string, container: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) => contract.methods.addBurnContainer(container));
  }

  public removeBurnContainer(address: string, container: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.removeBurnContainer(container),
    );
  }

  public enableRewardProvider(address: string, provider: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.enableRewardProvider(provider),
    );
  }

  public disableRewardProvider(address: string, provider: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.disableRewardProvider(provider),
    );
  }

  public lock(address: string, durationInBlocks: number) {
    return this.buildMethodRunnableMulti(address, async (contract, _) => contract.methods.lock(durationInBlocks));
  }

  public withdraw(address: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) => contract.methods.withdraw());
  }

  public withdrawBurn(address: string) {
    return this.buildMethodRunnableMulti(address, async (contract, _) => contract.methods.withdrawBurn());
  }

  public flipBurn(address: string, minAmountOut: number, amountIn: number) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.flipBurn(minAmountOut, amountIn),
    );
  }

  public smartBurn(address: string, minAmountOut: number, amount: number) {
    return this.buildMethodRunnableMulti(address, async (contract, _) =>
      contract.methods.smartBurn(minAmountOut, amount),
    );
  }
}
