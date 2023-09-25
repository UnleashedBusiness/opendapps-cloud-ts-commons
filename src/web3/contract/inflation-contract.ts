import {InflationAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract, BlockchainDefinition,
    Erc20TokenContract,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class InflationContract extends BaseTokenAwareContract {
    constructor(token: Erc20TokenContract, walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(token, walletConnection, transactionHelper);
    }

    protected override getAbi(): typeof InflationAbi {
        return InflationAbi;
    }

    public async tokenOfTokenomics(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'token', batch, callback);
    }

    public async maxCycles(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, address, 'maxCycles', batch, callback);
    }

    public async currentRewardsCycle(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, address, 'currentRewardsCycle', batch, callback);
    }

    public async blocksPerCycle(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, address, 'blocksPerCycle', batch, callback);
    }

    public async getPayees(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.getPayees(),
            batch,
            callback);
    }

    public async payeePercent(
        config: BlockchainDefinition,
        address: string,
        wallet: string,
         batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.payeePercent(wallet),
            batch,
            callback);
    }

    public async controller(
        config: BlockchainDefinition,
        address: string,
         batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.getController(),
            batch,
            callback);
    }

    public addPayee(address: string, account: string, shares: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.addPayee(account, shares)
        );
    }

    public changePayeeShare(address: string, account: string, shares: number) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.changePayee(account, shares)
        );
    }

    public removePayee(address: string, account: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, _) => contract.methods.removePayee(account)
        );
    }
}
