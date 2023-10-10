import {TokenAsAServiceAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BlockchainDefinition,
    Erc20TokenContract, ReadOnlyWeb3Connection,
    TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import BigNumber from "bignumber.js";
import {Web3BatchRequest} from "web3-core";

export class TokenAsAServiceContract extends Erc20TokenContract {
    constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
        super(web3Connection, transactionHelper);
    }

    protected override getAbi(): any {
        return TokenAsAServiceAbi;
    }

    public async isOwnedByNFT(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: boolean) => void
    ) {
        return this.getPropertyMulti(config, address, 'isOwnedByNFT', batch, callback);
    }

    public async tokenomics(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'tokenomics', batch, callback);
    }

    public async inflation(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'inflation', batch, callback);
    }

    public async ownershipCollection(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, address, 'ownershipCollection', batch, callback);
    }

    public async ownershipTokenId(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getPropertyMulti(config, address, 'ownershipTokenId', batch, callback);
    }

    public async tax(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: number) => void
    ) {
        return this.getViewMulti(config, address, contract => contract.methods.tax(), batch, callback);
    }

    public async maxSupply(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            (contract) => contract.methods.maxSupply(),
            batch,
            (result: number) =>
                callback
                    ? callback(this.wrap(result).dividedBy(10 ** this.decimalsSync(config, address)))
                    : undefined
        );
    }

    public async initialSupply(
        config: BlockchainDefinition,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: BigNumber) => void
    ) {
        return this.getViewMulti(
            config,
            address,
            (contract) => contract.methods.initialSupply(),
            batch,
            (result: number) =>
                callback
                    ? callback(this.wrap(result).dividedBy(10 ** this.decimalsSync(config, address)))
                    : undefined
        );
    }
}
