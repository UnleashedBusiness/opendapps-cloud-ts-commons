import {OwnershipNFTCollectionAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BlockchainDefinition,
    Erc721Contract,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";

export class OwnershipNftCollectionContract extends Erc721Contract {
    constructor(walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(walletConnection, transactionHelper);
    }

    protected override getAbi(): any {
        return OwnershipNFTCollectionAbi;
    }

    public async tokenURI(
        config: BlockchainDefinition,
        contract: string,
        tokenId: number,
        batch?: any,
        callback?: (result: string) => void
    ) {
        return this.getViewMulti(config, contract, contract1 => contract1.methods.tokenURI(tokenId), batch, callback);
    }
}
