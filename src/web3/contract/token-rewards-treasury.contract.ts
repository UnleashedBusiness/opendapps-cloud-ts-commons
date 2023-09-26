import {TokenRewardsTreasuryAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract, BlockchainDefinition,
    Erc20TokenContract,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import BigNumber from "bignumber.js";
import {Web3BatchRequest} from "web3-core";

export class TokenRewardsTreasuryContract extends BaseTokenAwareContract {
    constructor(
        tokenService: Erc20TokenContract,
        walletConnection: WalletConnectionService,
        transactionHelper: TransactionRunningHelperService
    ) {
        super(tokenService, walletConnection, transactionHelper);
    }

    protected getAbi(): any {
        return TokenRewardsTreasuryAbi;
    }

    public async getRewardTokens(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(config, contractAddress, contract => contract.methods.getRewardTokens(), batch, callback);
    }

    public async getPayees(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(config, contractAddress, contract => contract.methods.getPayees(), batch, callback);
    }

    public async payeePercent(
        config: BlockchainDefinition,
        contractAddress: string,
        payee: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.payeePercent(payee),
            batch,
            result => {
                if (callback !== undefined) {
                    callback((result as number) / 10);
                }
            });
    }

    public async available(
        config: BlockchainDefinition,
        contractAddress: string,
        token: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.available(token),
            batch,
            callback);
    }

    public async totalPendingPayment(
        config: BlockchainDefinition,
        contractAddress: string,
        payee: string,
        token: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            contract => contract.methods.totalPendingPayment(payee, token),
            token,
            batch,
            callback);
    }

    public async addRewardToken(contractAddress: string, tokenAddress: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.addRewardToken(tokenAddress));
    }

    public async removeRewardToken(contractAddress: string, tokenAddress: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.removeRewardToken(tokenAddress));
    }

    public async addPayee(contractAddress: string, payee: string, shares: number) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.addPayee(payee, Math.floor(shares * 10)));
    }

    public async changePayeeShare(contractAddress: string, payee: string, shares: number) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.changePayeeShare(payee, Math.floor(shares * 10)));
    }

    public async removePayee(contractAddress: string, payee: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.removePayee(payee));
    }

    public async release(contractAddress: string, tokenAddress: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.release(tokenAddress));
    }
}
