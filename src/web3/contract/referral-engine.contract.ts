import { ReferralsEngineAbi, ReferralsEngineAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseMultiChainContract,
    BlockchainDefinition,
    ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import Web3 from "web3";
import {Web3BatchRequest} from "web3-core";

export class ReferralEngineContract extends BaseMultiChainContract<ReferralsEngineAbiFunctional> {

    constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(web3Connection, transactionHelper);
    }

    protected getAbi(): any {
        return ReferralsEngineAbi;
    }

    public defaultPercent(config: BlockchainDefinition, contractAddress: string, batch?: any, callback?: (result: number) => void) {
        return this.getPropertyMulti(config, contractAddress, "defaultPercent", batch, callback);
    }

    public getCompensationPercent(
        config: BlockchainDefinition,
        contractAddress: string,
        refCode: string,
        batch?: Web3BatchRequest,
        callback?: (result: { percent: number, receiver: string }) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.getCompensationPercent(Web3.utils.sha3(refCode)),
            batch,
            callback);
    }

    public assignRefCodeToSelf(contractAddress: string, refCode: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.assignRefCodeToSelf(Web3.utils.sha3(refCode))
        );
    }

    public assignRefCodeToAddress(contractAddress: string, refCode: string, address: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.assignRefCodeToAddress(Web3.utils.sha3(refCode), address)
        );
    }

    public assignRefCodeToAddressWithCustomSize(contractAddress: string, refCode: string, address: string, customSize: number) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.assignRefCodeToAddressWithCustomSize(Web3.utils.sha3(refCode), address, customSize)
        );
    }

    public disableRefCode(contractAddress: string, refCode: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) => contract.methods.disableRefCode(Web3.utils.sha3(refCode))
        );
    }
}
