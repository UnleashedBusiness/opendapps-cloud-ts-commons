import {DecentralizedEntityInterfaceContract} from "./decentralized-entity-interface.contract";
import { MultiSignEntityAbi, MultiSignEntityAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BlockchainDefinition, ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class MultiSignEntityContract extends DecentralizedEntityInterfaceContract<MultiSignEntityAbiFunctional> {
    constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(web3Connection, transactionHelper);
    }

    protected override getAbi(): any {
        return MultiSignEntityAbi;
    }

    public async requiredRootSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, entityAddress, "requiredRootSignatures", batch, callback);
    }

    public async requiredTotalSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, entityAddress, "requiredTotalSignatures", batch, callback);
    }

    public async availableRootSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, entityAddress, "availableRootSignatures", batch, callback);
    }

    public async availableTotalSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, entityAddress, "availableTotalSignatures", batch, callback);
    }

    public async currentRootSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            entityAddress,
            async contract => contract.methods.currentRootSignatures(proposal),
            batch,
            callback
        );
    }

    public async currentTotalSignatures(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(
            config,
            entityAddress,
            async contract => contract.methods.currentTotalSignatures(proposal),
            batch,
            callback);
    }

    public async hasVoted(
        config: BlockchainDefinition,
        entityAddress: string,
        proposal: string,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getViewMulti(
            config,
            entityAddress,
            async contract => contract.methods.hasVoted(proposal, address),
            batch,
            callback);
    }

    public getPromoteRootData(entityAddress: string, address: string): Promise<string> {
        return this.getRunMethodDataMulti(
            entityAddress,
            contract => contract.methods.promoteRoot(address)
        );
    }

    public getPromoteLeafData(entityAddress: string, address: string): Promise<string> {
        return this.getRunMethodDataMulti(
            entityAddress,
            contract => contract.methods.promoteLeaf(address)
        );
    }

    public getDemoteRootData(entityAddress: string, address: string): Promise<string> {
        return this.getRunMethodDataMulti(
            entityAddress,
            contract => contract.methods.demoteRoot(address)
        );
    }

    public getDemoteLeafData(entityAddress: string, address: string): Promise<string> {
        return this.getRunMethodDataMulti(
            entityAddress,
            contract => contract.methods.demoteLeaf(address)
        );
    }
}
