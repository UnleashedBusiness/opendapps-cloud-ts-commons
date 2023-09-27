import {
    BaseMultiChainContract,
    BlockchainDefinition, TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";
import {OpenDAppsCloudRouterAbi} from "@unleashed-business/opendapps-cloud-ts-abi/dist/abi/opendapps-cloud-router.abi";
import {config} from "rxjs";

export default class OpenDAppsCloudRouterContract extends BaseMultiChainContract {
    private propertyValueCache: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>();

    constructor(walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(walletConnection, transactionHelper);
    }

    protected getAbi(): typeof OpenDAppsCloudRouterAbi {
        return OpenDAppsCloudRouterAbi;
    }

    public async proxyAdmin(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "proxyAdmin", batch, callback);
    }

    public async referralsEngine(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "referralsEngine", batch, callback);
    }

    public async contractDeployer(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "referralsEngine", batch, callback);
    }

    public async tokenAsAServiceDeployer(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "tokenAsAServiceDeployer", batch, callback);
    }

    public async decentralizedEntityDeployer(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "decentralizedEntityDeployer", batch, callback);
    }

    public async stakingAsAServiceDeployer(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "stakingAsAServiceDeployer", batch, callback);
    }

    public async assetBackingDeployer(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, "assetBackingDeployer", batch, callback);
    }


    protected async getPropertyMulti<T>(config: BlockchainDefinition, contractAddress: string, propertyName: string, batch?: Web3BatchRequest, callback?: (result: T) => void): Promise<void | T> {
        if (!this.propertyValueCache.has(config.network))
            this.propertyValueCache.set(config.network, new Map());
        if (!this.propertyValueCache.get(config.network)?.has(contractAddress))
            this.propertyValueCache.get(config.network)?.set(
                contractAddress,
                new Map()
            );
        if (!this.propertyValueCache.get(config.network)?.get(contractAddress)?.has(propertyName))
            this.propertyValueCache.get(config.network)?.get(contractAddress).set(
                contractAddress,
                await this.getPropertyMulti(config, contractAddress, propertyName) as T
            );

        if (callback) {
            callback(this.propertyValueCache.get(config.network)?.get(contractAddress)?.get(propertyName) as T);
            return;
        } else
            return this.propertyValueCache.get(config.network)?.get(contractAddress)?.get(propertyName) as T;
    }
}