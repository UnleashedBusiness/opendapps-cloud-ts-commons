import {StakingAsAServiceAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract, BlockchainDefinition,
    Erc20TokenContract, MethodRunnable,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import BigNumber from "bignumber.js";
import {Web3BatchRequest} from "web3-core";

export class StakingAsAServiceContract extends BaseTokenAwareContract {
    private stakingToTokenCache: { [index: string]: { [index: string]: string } } = {};

    constructor(token: Erc20TokenContract, walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(token, walletConnection, transactionHelper);
    }

    protected getAbi(): any {
        return StakingAsAServiceAbi;
    }

    private async getTokenForStaking(config: BlockchainDefinition, staking: string): Promise<string> {
        if (typeof this.stakingToTokenCache[config.network] === 'undefined') {
            this.stakingToTokenCache[config.network] = {};
        }

        if (typeof this.stakingToTokenCache[config.network][staking] === 'undefined') {
            this.stakingToTokenCache[config.network][staking] = await this.getPropertyMulti(config, staking, 'stakingToken') as string;
        }
        return this.stakingToTokenCache[config.network][staking];
    }

    public async minStake(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.minStake(),
            await this.getTokenForStaking(config, contractAddress),
            batch,
            callback);
    }

    public async maxStake(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.maxStake(),
            await this.getTokenForStaking(config, contractAddress),
            batch,
            callback);
    }

    public async vaultOf(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.vaultOf(user),
            batch,
            callback);
    }

    public async totalVaultShares(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.totalVaultShares(),
            batch,
            callback);
    }

    public async availableRewards(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        token: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.availableRewards(user, token),
            token,
            batch,
            callback);
    }

    public async accountShares(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.accountShares(user),
            batch,
            callback);
    }

    public async balanceOf(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.balanceOf(user),
            await this.getTokenForStaking(config, contractAddress),
            batch,
            callback);
    }

    public async unlockedBalanceOf(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.unlockedBalanceOf(user),
            await this.getTokenForStaking(config, contractAddress),
            batch,
            callback);
    }

    public async lockedBalanceOf(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.lockedBalanceOf(user),
            await this.getTokenForStaking(config, contractAddress),
            batch,
            callback);
    }

    public async lockedUntil(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.lockedUntilBlock(user),
            batch,
            callback);
    }

    public async currentSharesMultiplier(
        config: BlockchainDefinition,
        contractAddress: string,
        user: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        if (callback !== undefined) {
            return this.getViewMulti(
                config,
                contractAddress,
                contract => contract.methods.currentSharesMultiplier(user),
                batch,
                result => {
                    callback(this.wrap(result as number).dividedBy(10 ** 12).toNumber())
                });
        } else {
            return this.wrap(
                await this.getViewMulti(
                    config,
                    contractAddress,
                    contract => contract.methods.currentSharesMultiplier(user)) as number
            ).dividedBy(10 ** 12).toNumber();
        }
    }

    public async lockingEnabled(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'locksEnabled', batch, callback);
    }

    public async maxLockEpochs(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'maxLockEpochs', batch, callback);
    }

    public async minLockEpochs(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'minLockEpochs', batch, callback);
    }

    public async lockEpochRewardRate(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        if (callback !== undefined) {
            return this.getViewMulti(
                config,
                contractAddress,
                contract => contract.methods.lockEpochRewardRate(),
                batch,
                result => {
                    callback(this.wrap(result as number).dividedBy(10 ** 12).toNumber())
                });
        } else {
            return this.wrap(
                await this.getViewMulti(
                    config,
                    contractAddress,
                    contract => contract.methods.lockEpochRewardRate()
                ) as number)
                .dividedBy(10 ** 12)
                .toNumber();
        }
    }

    public async epoch(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'currentEpoch', batch, callback);
    }

    public async epochCanBeRaised(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'epochCanBeRaised', batch, callback);
    }

    public async epochPrev(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'epochPrev', batch, callback);
    }

    public async epochBlockDistance(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'epochBlockDistance', batch, callback);
    }

    public async totalAvailableRewards(
        config: BlockchainDefinition,
        contractAddress: string,
        token: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.totalAvailableRewards(token),
            token,
            batch,
            callback);
    }

    public async epochAvailableRewards(
        config: BlockchainDefinition,
        contractAddress: string,
        rewardToken: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.epochAvailableRewards(rewardToken),
            rewardToken,
            batch,
            callback);
    }

    public async maxRewardsPerEpochForToken(
        config: BlockchainDefinition,
        contractAddress: string,
        rewardToken: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.maxRewardsPerEpochForToken(rewardToken),
            rewardToken,
            batch,
            callback);
    }

    public async epochLastRaise(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'epochLastRaise', batch, callback);
    }

    public async rewardProviders(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'rewardProviders', batch, callback);
    }

    public async rewardTokens(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'rewardTokens', batch, callback);
    }

    public async incrementEpochManual(contractAddress: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.raiseEpoch()
        );
    }

    public async enableRewardProvider(contractAddress: string, provider: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.enableRewardProvider(provider)
        );
    }

    public async disableRewardProvider(contractAddress: string, provider: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.disableRewardProvider(provider)
        );
    }

    public async enableRewardTokenSimple(contractAddress: string, token: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.enableRewardToken(token)
        );
    }

    public async disableRewardToken(contractAddress: string, token: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.disableRewardToken(token)
        );
    }

    public async setEpochBlockDistance(contractAddress: string, blockDistance: number) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.setEpochBlockDistance(blockDistance)
        );
    }

    public async setMinMaxStake(contractAddress: string, min: BigNumber, max: BigNumber): Promise<MethodRunnable> {
        const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress)
        const division = await this.tokenDivision(this.walletConnection.blockchain, token);
        min = min.multipliedBy(division).decimalPlaces(0);
        max = max.multipliedBy(division).decimalPlaces(0);

        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.setMinMaxStake(min.toString(), max.toString())
        );
    }

    public async setEpochMaxRewards(contractAddress: string, token: string, maxRewardsPerEpoch: BigNumber) {
        const division = await this.tokenDivision(this.walletConnection.blockchain, token);
        maxRewardsPerEpoch = maxRewardsPerEpoch.multipliedBy(division).decimalPlaces(0);
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.setEpochMaxRewards(token, maxRewardsPerEpoch.toString())
        );
    }

    public async enableLocks(
        contractAddress: string,
        minEpochLength: number,
        maxEpochLength: number,
        rewardsRate: number,
    ) {
        const rewardsRateBN = this.wrap(rewardsRate).multipliedBy(10 ** 12).decimalPlaces(0);
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.enableLocks(minEpochLength, maxEpochLength, rewardsRateBN.toString())
        );
    }

    public async disableLocks(contractAddress: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.disableLocks()
        );
    }

    public async deposit(contractAddress: string, amount: BigNumber) {
        const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress);
        const division = await this.tokenDivision(this.walletConnection.blockchain, token);
        amount = amount.multipliedBy(division);
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.deposit(amount.toString())
        );
    }

    public async withdraw(contractAddress: string, amount: BigNumber) {
        const token = await this.getTokenForStaking(this.walletConnection.blockchain, contractAddress);
        const division = await this.tokenDivision(this.walletConnection.blockchain, token);
        amount = amount.multipliedBy(division);
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.withdraw(amount.toString())
        );
    }

    public async lock(contractAddress: string, epochs: number) {
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.lock(epochs)
        );
    }

    public async withdrawRewards(contractAddress: string, token: string) {
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.withdrawRewards(token)
        );
    }

    public async createVault(contractAddress: string) {
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.createVault()
        );
    }

    public async collectRewards(contractAddress: string, user: string) {
        await this.runMethodConnectedMulti(
            contractAddress,
            (contract, _) => contract.methods.collectRewards(user)
        );
    }
}
