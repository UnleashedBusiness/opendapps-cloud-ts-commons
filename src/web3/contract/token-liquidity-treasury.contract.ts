import {
  TokenLiquidityTreasuryAbi,
  TokenLiquidityTreasuryAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseTokenAwareContract,
  BlockchainDefinition,
  Erc20TokenContract,
  MethodRunnable,
} from '@unleashed-business/ts-web3-commons';
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';
import { NumericResult } from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract.types';
import BigNumber from 'bignumber.js';
import { Web3BatchRequest } from 'web3-core';

export class TokenLiquidityTreasuryContract extends BaseTokenAwareContract<TokenLiquidityTreasuryAbiFunctional> {
  constructor(token: Erc20TokenContract, toolkit: ContractToolkitService) {
    super(token, toolkit);
  }

  protected getAbi(): any {
    return TokenLiquidityTreasuryAbi;
  }

  public async tokenAddress(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'token', batch, callback);
  }

  public async ownerRewardsPerCycle(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const token = (await this.tokenAddress(config, contractAddress)) as string;
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.ownerRewardsPerCycle(),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async totalOwnerRewardCycles(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'totalOwnerRewardCycles',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async ownerRewardsReleaseBlocks(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'ownerRewardsReleaseBlocks',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async claimedOwnerRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const token = (await this.tokenAddress(config, contractAddress)) as string;
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.claimedOwnerRewards(),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async initialTime(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'initialTime',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async isTokenListedOnDex(
    config: BlockchainDefinition,
    contractAddress: string,
    router: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.isTokenListedOnDex(router),
      batch,
      callback,
    );
  }

  public async isTokenListedOnAnyDex(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.isTokenListedOnAnyDex(),
      batch,
      callback,
    );
  }

  public async getTokenDexListingPair(
    config: BlockchainDefinition,
    contractAddress: string,
    weth: string,
    router: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.getTokenDexListingPair(weth, router),
      batch,
      callback,
    );
  }

  public async getTokenDexListings(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string[]) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.getTokenDexListings(),
      batch,
      callback,
    );
  }

  public async remainingOwnerRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const token = (await this.tokenAddress(config, contractAddress)) as string;
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.unclaimedOwnerRewards(),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async availableOwnerRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    const token = (await this.tokenAddress(config, contractAddress)) as string;
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.claimableOwnerRewards(),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async releaseOwnerRewards(contractAddress: string, tokenAmount: string): Promise<MethodRunnable> {
    const token = (await this.tokenAddress(this.walletConnection.blockchain, contractAddress)) as string;
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(division).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.claimOwnerRewards(tokenAmountBN.toString(10)),
    );
  }

  public async removeLiquidity(
    contractAddress: string,
    router: string,
    weth: string,
    tokenAmount: string,
  ): Promise<MethodRunnable> {
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(10 ** 18).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.removeLiquidityV2(router, weth, tokenAmountBN.toString(10)),
    );
  }

  public async swapNativeToWrapped(
    contractAddress: string,
    weth: string,
    tokenAmount: BigNumber,
  ): Promise<MethodRunnable> {
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(10 ** 18).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.swapNativeToWrapped(weth, tokenAmountBN.toString(10)),
    );
  }

  public async swapWrappedToNative(
    contractAddress: string,
    weth: string,
    tokenAmount: BigNumber,
  ): Promise<MethodRunnable> {
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(10 ** 18).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.swapWrappedToNative(weth, tokenAmountBN.toString(10)),
    );
  }

  public async swapWrappedToToken(
    contractAddress: string,
    router: string,
    weth: string,
    tokenAmount: BigNumber,
  ): Promise<MethodRunnable> {
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(10 ** 18).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.swapWrappedNativeForToken(router, weth, tokenAmountBN.toString(10)),
    );
  }

  public async swapNativeToToken(
    contractAddress: string,
    router: string,
    weth: string,
    tokenAmount: BigNumber,
  ): Promise<MethodRunnable> {
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(10 ** 18).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.swapNativeForToken(router, weth, tokenAmountBN.toString(10)),
    );
  }

  public async burn(contractAddress: string, tokenAmount: BigNumber): Promise<MethodRunnable> {
    const token = (await this.tokenAddress(this.walletConnection.blockchain, contractAddress)) as string;
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    const tokenAmountBN = new BigNumber(tokenAmount).multipliedBy(division).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.burn(tokenAmountBN.toString(10)),
    );
  }
}
