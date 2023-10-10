import {DecentralizedEntityInterfaceContract} from "./decentralized-entity-interface.contract";
import {MultiSignSharesEntityAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BlockchainDefinition, ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class MultiSignSharesEntityContract extends DecentralizedEntityInterfaceContract {

    constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(web3Connection, transactionHelper);
    }

    protected override getAbi(): any {
        return MultiSignSharesEntityAbi;
    }

    public async hasVoted(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getViewMulti(config, entityAddress, contract => contract.methods.hasVoted(proposal, address), batch, callback);
    }

    public async ownershipCollection(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getViewMulti(config, entityAddress, contract => contract.methods.ownershipCollection(), batch, callback);
    }

    public async ownershipTokenId(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, entityAddress, contract => contract.methods.ownershipTokenId(), batch, callback);
    }

    public async requiredSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        batch?: Web3BatchRequest, callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, entityAddress, contract => contract.methods.requiredSignatures(proposal), batch, callback);
    }

    public async currentSharesSigned(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        batch?: Web3BatchRequest, callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, entityAddress, contract => contract.methods.currentSharesSigned(proposal), batch, callback);
    }
}
