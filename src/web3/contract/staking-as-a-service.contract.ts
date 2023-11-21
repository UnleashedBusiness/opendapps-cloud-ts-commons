import { StakingAsAServiceAbi, StakingAsAServiceAbiFunctional } from '@unleashed-business/opendapps-cloud-ts-abi';
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

export class StakingAsAServiceContract extends BaseTokenAwareContract<StakingAsAServiceAbiFunctional> {
  private stakingToTokenCache: { [index: string]: { [index: string]: string } } = {};

  constructor(token: Erc20TokenContract, toolkit: ContractToolkitService) {
    super(token, toolkit);
  }

  protected getAbi(): any {
    return StakingAsAServiceAbi;
  }

  private async getTokenForStaking(config: BlockchainDefinition, staking: string): Promise<string> {
    if (typeof this.stakingToTokenCache[config.network] === 'undefined') {
      this.stakingToTokenCache[config.network] = {};
    }

    if (typeof this.stakingToTokenCache[config.network][staking] === 'undefined') {
      this.stakingToTokenCache[config.network][staking] = (await this.getPropertyMulti(
        config,
        staking,
        'stakingToken',
      )) as string;
    }
    return this.stakingToTokenCache[config.network][staking];
  }

  public async minStake(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.minStake(),
      await this.getTokenForStaking(config, contractAddress),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async maxStake(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.maxStake(),
      await this.getTokenForStaking(config, contractAddress),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async vaultOf(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(config, contractAddress, (contract) => contract.methods.vaultOf(user), batch, callback);
  }

  public async totalVaultShares(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.totalVaultShares(),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async availableRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    token: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.availableRewards(user, token),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async accountShares(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.accountShares(user),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async balanceOf(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.balanceOf(user),
      await this.getTokenForStaking(config, contractAddress),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async unlockedBalanceOf(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.unlockedBalanceOf(user),
      await this.getTokenForStaking(config, contractAddress),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async lockedBalanceOf(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.lockedBalanceOf(user),
      await this.getTokenForStaking(config, contractAddress),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async lockedUntil(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      contractAddress,
      (contract) => contract.methods.lockedUntilBlock(user),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async currentSharesMultiplier(
    config: BlockchainDefinition,
    contractAddress: string,
    user: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    if (callback !== undefined) {
      return this.getViewMulti<bigint>(
        config,
        contractAddress,
        (contract) => contract.methods.currentSharesMultiplier(user),
        batch,
        (result) => {
          callback(
            this.wrap(result)
              .dividedBy(10 ** 12)
              .toNumber(),
          );
        },
      );
    } else {
      return this.wrap(
        (await this.getViewMulti(config, contractAddress, (contract) =>
          contract.methods.currentSharesMultiplier(user),
        )) as number,
      )
        .dividedBy(10 ** 12)
        .toNumber();
    }
  }

  public async lockingEnabled(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'locksEnabled', batch, callback);
  }

  public async maxLockEpochs(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'maxLockEpochs',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async minLockEpochs(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'minLockEpochs',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async lockEpochRewardRate(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    if (callback !== undefined) {
      return this.getViewMulti(
        config,
        contractAddress,
        (contract) => contract.methods.lockEpochRewardRate(),
        batch,
        (result) => {
          callback(
            this.wrap(result as bigint)
              .dividedBy(10 ** 12)
              .toNumber(),
          );
        },
      );
    } else {
      return this.wrap(
        (await this.getViewMulti(config, contractAddress, (contract) =>
          contract.methods.lockEpochRewardRate(),
        )) as number,
      )
        .dividedBy(10 ** 12)
        .toNumber();
    }
  }

  public async epoch(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'currentEpoch',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async epochCanBeRaised(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'epochCanBeRaised', batch, callback);
  }

  public async epochPrev(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'epochPrev',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async epochBlockDistance(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'epochBlockDistance',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async totalAvailableRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    token: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.totalAvailableRewards(token),
      token,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async epochAvailableRewards(
    config: BlockchainDefinition,
    contractAddress: string,
    rewardToken: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.epochAvailableRewards(rewardToken),
      rewardToken,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async maxRewardsPerEpochForToken(
    config: BlockchainDefinition,
    contractAddress: string,
    rewardToken: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewWithDivision(
      config,
      contractAddress,
      (contract) => contract.methods.maxRewardsPerEpochForToken(rewardToken),
      rewardToken,
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result)) : undefined,
    );
  }

  public async epochLastRaise(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      contractAddress,
      'epochLastRaise',
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async rewardProviders(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string[]) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'rewardProviders', batch, callback);
  }

  public async rewardTokens(
    config: BlockchainDefinition,
    contractAddress: string,
    batch?: Web3BatchRequest,
    callback?: (result: string[]) => void,
  ) {
    return this.getPropertyMulti(config, contractAddress, 'rewardTokens', batch, callback);
  }

  public async incrementEpochManual(contractAddress: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) => contract.methods.raiseEpoch());
  }

  public async enableRewardProvider(contractAddress: string, provider: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.enableRewardProvider(provider),
    );
  }

  public async disableRewardProvider(contractAddress: string, provider: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.disableRewardProvider(provider),
    );
  }

  public async enableRewardTokenSimple(contractAddress: string, token: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) => contract.methods.enableRewardToken(token));
  }

  public async disableRewardToken(contractAddress: string, token: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) => contract.methods.disableRewardToken(token));
  }

  public async setEpochBlockDistance(contractAddress: string, blockDistance: number) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.setEpochBlockDistance(blockDistance),
    );
  }

  public async setMinMaxStake(contractAddress: string, min: BigNumber, max: BigNumber): Promise<MethodRunnable> {
    const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress);
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    min = min.multipliedBy(division).decimalPlaces(0);
    max = max.multipliedBy(division).decimalPlaces(0);

    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.setMinMaxStake(min.toString(10), max.toString(10)),
    );
  }

  public async setEpochMaxRewards(contractAddress: string, token: string, maxRewardsPerEpoch: BigNumber) {
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    maxRewardsPerEpoch = maxRewardsPerEpoch.multipliedBy(division).decimalPlaces(0);
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.setEpochMaxRewards(token, maxRewardsPerEpoch.toString(10)),
    );
  }

  public async enableLocks(
    contractAddress: string,
    minEpochLength: number,
    maxEpochLength: number,
    rewardsRate: number,
  ) {
    const rewardsRateBN = this.wrap(rewardsRate)
      .multipliedBy(10 ** 12)
      .decimalPlaces(0);
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) =>
      contract.methods.enableLocks(minEpochLength, maxEpochLength, rewardsRateBN.toString(10)),
    );
  }

  public async disableLocks(contractAddress: string) {
    return this.buildMethodRunnableMulti(contractAddress, (contract, _) => contract.methods.disableLocks());
  }

  public async deposit(contractAddress: string, amount: BigNumber) {
    const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress);
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    amount = amount.multipliedBy(division);
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.deposit(amount.toString(10)));
  }

  public async withdraw(contractAddress: string, amount: BigNumber) {
    const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress);
    const division = await this.tokenDivision(this.walletConnection.blockchain, token);
    amount = amount.multipliedBy(division);
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.withdraw(amount.toString(10)));
  }

  public async lock(contractAddress: string, epochs: number) {
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.lock(epochs));
  }

  public async withdrawRewards(contractAddress: string, token: string) {
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.withdrawRewards(token));
  }

  public async createVault(contractAddress: string) {
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.createVault());
  }

  public async collectRewards(contractAddress: string, user: string) {
    await this.runMethodConnectedMulti(contractAddress, (contract, _) => contract.methods.collectRewards(user));
  }
}
