import Web3 from "web3";
import {DecentralizedEntityDeployerAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseMultiChainContract, BlockchainDefinition, MethodRunnable,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class DecentralizedEntityDeployerContract extends BaseMultiChainContract {
    public static readonly GROUP_DECENTRALIZED_COMPANY = Web3.utils.soliditySha3("DecentralizedCompany")!!;

    constructor(walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(walletConnection, transactionHelper);
    }

    protected getAbi(): typeof DecentralizedEntityDeployerAbi {
        return DecentralizedEntityDeployerAbi;
    }

    public async ownershipNFTCollection(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getPropertyMulti(config, contractAddress, 'ownershipNFTCollection', batch, callback);
    }

    public async deploySingleOwnerEntity(contractAddress: string, name: string, metadataUrl: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract) => contract.methods.deploySingleOwnerEntity(name, metadataUrl));
    }

    public async deployMultiSignEntity(contractAddress: string, name: string, signatureCollectionBlocks: number, metadataUrl: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract) => contract.methods.deployMultiSignEntity(name, signatureCollectionBlocks, metadataUrl));
    }

    public async deployMultiSignSharesEntity(contractAddress: string, name: string, signatureCollectionBlocks: number, metadataUrl: string) {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract) => contract.methods.deployMultiSignSharesEntity(name, signatureCollectionBlocks, metadataUrl));
    }

    public upgradeTreasury(contractAddress: string, treasury: string): MethodRunnable {
        return this.buildMethodRunnableMulti(
            contractAddress,
            async (contract, connectedAddress) => contract.methods.upgradeTreasury(treasury)
        );
    }

}
