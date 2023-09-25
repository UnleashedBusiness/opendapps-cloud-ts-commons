import BigNumber from "bignumber.js";
import {
    BaseTokenAwareContract, BlockchainDefinition, EmptyAddress, Erc20TokenContract,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import {ContractAbi} from "web3-types";
import {Web3BatchRequest} from "web3-core";

export abstract class BaseDeployerContract extends BaseTokenAwareContract {
    protected constructor(tokenService: Erc20TokenContract, walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(tokenService, walletConnection, transactionHelper);
    }

    public async isUpgradeable(
        config: BlockchainDefinition,
        contractAddress: string,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getViewMulti(config, contractAddress, async (contract) => contract.methods.isUpgradeable(address), batch, callback);
    }

    public async deployTaxForAddress(
        config: BlockchainDefinition,
        contractAddress: string,
        address: string,
        group: string,
        type: number,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewWithDivision(
            config,
            contractAddress,
            async contract => contract.methods.deployTaxForAddress(address, group, type), EmptyAddress, batch, callback);
    }
}
