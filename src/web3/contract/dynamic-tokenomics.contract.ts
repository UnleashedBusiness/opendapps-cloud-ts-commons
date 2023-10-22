import BigNumber from "bignumber.js";
import { DynamicTokenomicsAbi, DynamicTokenomicsAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract, BlockchainDefinition,
    Erc20TokenContract, ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class DymanicTokenomicsContractService extends BaseTokenAwareContract<DynamicTokenomicsAbiFunctional> {
    constructor(token: Erc20TokenContract, web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(token, web3Connection, transactionHelper);
    }

    protected override getAbi(): typeof DynamicTokenomicsAbi {
        return DynamicTokenomicsAbi;
    }

    public async maxTransactionAmount(
        config: BlockchainDefinition,
        address: string,
        tokenAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            address,
            contract => contract.methods.maxTransactionAmount(),
            tokenAddress,
            batch,
            callback);
    }

    public async maxWalletHoldingAmount(
        config: BlockchainDefinition,
        address: string,
        tokenAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            address,
            contract => contract.methods.maxWalletHoldingAmount(),
            tokenAddress,
            batch,
            callback);
    }

    public async isInTaxablePathWhitelist(
        config: BlockchainDefinition,
        address: string,
        wallet: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.isInTaxablePathWhitelist(wallet),
            batch,
            callback);
    }

    public async availableTaxableConfigurations(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.availableTaxableConfigurations(),
            batch,
            callback);
    }

    public async defaultRouter(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'defaultRouter', batch, callback);
    }

    public async tokenOfTokenomics(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'token', batch, callback);
    }

    public async getTransactionRestrictionWhitelist(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, address, 'getTransactionRestrictionWhitelist', batch, callback);
    }

    public async getWalletSizeRestrictionWhitelist(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, address, 'getWalletSizeRestrictionWhitelist', batch, callback);
    }

    public async getBurnAddressList(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, address, 'getBurnAddressList', batch, callback);
    }

    public async getAutoReleaseList(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, address, 'getAutoReleaseList', batch, callback);
    }

    public async getRouterAddressList(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getPropertyMulti(config, address, 'getRouterAddressList', batch, callback);
    }

    public async getPayees(
        config: BlockchainDefinition,
        n: number,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.getPayees(n),
            batch,
            callback);
    }

    public async payeePercent(
        config: BlockchainDefinition,
        n: number,
        address: string,
        wallet: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.payeePercent(n, wallet),
            batch,
            callback);
    }

    public async totalTax(
        config: BlockchainDefinition,
        n: number,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.totalTax(n),
            batch,
            callback);
    }

    public async totalTaxForPath(
        config: BlockchainDefinition,
        address: string,
        from: string,
        to: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            async (contract) => contract.methods.totalTax(from, to),
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

    public addPayee(
        address: string,
        n: number,
        account: string,
        shares: number,
        nativeShares: number
    ) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, connectedAddress) => contract.methods.addPayee(n, account, shares, nativeShares)
        );
    }

    public changePayeeShare(
        address: string,
        n: number,
        account: string,
        shares: number,
        nativeShares: number
    ) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, connectedAddress) => contract.methods.changePayeeShare(n, account, shares, nativeShares)
        );
    }

    public removePayee(address: string, n: number, account: string) {
        return this.buildMethodRunnableMulti(
            address,
            async (contract, connectedAddress) => contract.methods.removePayee(account, n)
        );
    }

    public async setMaxWalletHoldAmount(contractAddress: string, tokenAddress: string, amount: string) {
        const amountBN = new BigNumber(amount).multipliedBy(await this.tokenDivisionConnected(tokenAddress));

        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.setMaxWalletHoldAmount(amountBN.toString())
        );
    }

    public async setMaxTransactionAmount(contractAddress: string, tokenAddress: string, amount: string) {
        const amountBN = new BigNumber(amount).multipliedBy(await this.tokenDivisionConnected(tokenAddress));

        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.setMaxTransactionAmount(amountBN.toString())
        );
    }

    public async addTaxForPath(contractAddress: string, from: string, to: string, i: number) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.addTaxForPath(from, to, i)
        );
    }

    public async addWalletToAutoReleaseAddressList(contractAddress: string, wallet: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.addWalletToAutoReleaseAddressList(wallet)
        );
    }

    public async removeTaxForPath(contractAddress: string, from: string, to: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.removeTaxFromPath(from, to)
        );
    }

    public async addToTaxablePathWhitelist(contractAddress: string, wallet: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract1) => contract1.methods.addToTaxablePathWhitelist(wallet)
        );
    }
}
