import {
    AssetBackingAbi,
    AssetBackingAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract,
    BlockchainDefinition,
    Erc20TokenContract, ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class AssetBackingContract extends BaseTokenAwareContract<AssetBackingAbiFunctional> {

    constructor(token: Erc20TokenContract, web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(token, web3Connection, transactionHelper);
    }

    protected override getAbi(): any {
        return AssetBackingAbi;
    }

    public async isOwnedByNFT(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getPropertyMulti(config, address, 'isOwnedByNFT', batch, callback);
    }

    public async backingAmount(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.backingAmount(), batch, callback);
    }

    public async smartBurnedAmount(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.smartBurnedAmount(), batch, callback);
    }

    public async backedTokenCirculatingSupply(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.backedTokenCirculatingSupply(), batch, callback);
    }

    public async floorPrice(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.floorPrice(), batch, callback);
    }

    public async flipFloorPrice(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.flipFloorPrice(), batch, callback);
    }

    public async pendingBackingFromProviders(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.pendingBackingFromProviders(), batch, callback);
    }

    public async burnContainersArray(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.burnContainersArray(), batch, callback);
    }

    public setRewardsPullCooldown(address: string, rewardsPullCooldown: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.setRewardsPullCooldown(rewardsPullCooldown)
        );
    }

    public setRewardsPullThreshold(address: string, rewardsPullThreshold: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.setRewardsPullThreshold(rewardsPullThreshold)
        );
    }

    public addBurnContainer(address: string, container: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.addBurnContainer(container)
        );
    }

    public removeBurnContainer(address: string, container: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.removeBurnContainer(container)
        );
    }

    public enableRewardProvider(address: string, provider: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.enableRewardProvider(provider)
        );
    }

    public disableRewardProvider(address: string, provider: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.disableRewardProvider(provider)
        );
    }

    public lock(address: string, durationInBlocks: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.lock(durationInBlocks)
        );
    }

    public flipBurn(address: string, minAmountOut: number, amountIn: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.flipBurn(minAmountOut, amountIn)
        );
    }

    public smartBurn(address: string, minAmountOut: number, amount: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.smartBurn(minAmountOut, amount)
        );
    }

}
