import {TokenAsAServiceDeployerAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
    BaseTokenAwareContract, BlockchainDefinition,
    Erc20TokenContract, MethodRunnable,
    TransactionRunningHelperService,
    WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import {Web3BatchRequest} from "web3-core";

export class TokenAsAServiceDeployerContract extends BaseTokenAwareContract {

    public static readonly GROUP_TOKEN = Web3.utils.soliditySha3("Token")!;
    public static readonly GROUP_TOKENOMICS = Web3.utils.soliditySha3("Tokenomics")!;

    constructor(tokenService: Erc20TokenContract, walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
        super(tokenService, walletConnection, transactionHelper);
    }

    protected getAbi(): any {
        return TokenAsAServiceDeployerAbi;
    }

    public async wethForDex(
        config: BlockchainDefinition,
        contractAddress: string,
        address: string,
        batch?: Web3BatchRequest,
        callback?: (result: string) => void
    ) {
        return this.getViewMulti(
            config,
            contractAddress,
            contract => contract.methods.weth(address),
            batch,
            callback
        );
    }

    public async availableDexRouters(
        config: BlockchainDefinition,
        contractAddress: string,
        batch?: Web3BatchRequest,
        callback?: (result: string[]) => void
    ) {
        return this.getViewMulti(
            config, contractAddress,
            contract => contract.methods.availableDexRouters(),
            batch,
            callback);
    }

    public async deployInflationToken(
        contractAddress: string,
        name: string,
        ticker: string,
        supply: BigNumber,
        initialSupplyPercent: number,
        rewardRounds: number,
        blockPerCycle: number,
        ownerAmount: BigNumber,
        metadataUrl: string,
        value: BigNumber,
        refCode?: string
    ) {
        const supplyBN = supply.multipliedBy(10 ** 18);
        const ownerBN = ownerAmount.multipliedBy(10 ** 18);

        return this.buildMethodRunnableMulti(contractAddress,
            (contract, _) => contract.methods.deployInflationaryToken(
                name,
                ticker,
                supplyBN.toString(),
                initialSupplyPercent,
                rewardRounds, blockPerCycle,
                ownerBN.toString(),
                metadataUrl,
                refCode !== undefined
                    ? Web3.utils.sha3(refCode)
                    : '0x'
            ),
            async () => {
            },
            async () => value.multipliedBy(10 ** 18));
    }


    public async deployHardCapToken(
        contractAddress: string,
        name: string,
        ticker: string,
        supply: BigNumber,
        ownerAmount: BigNumber,
        complexTax: boolean,
        metadataUrl: string,
        value: BigNumber,
        refCode?: string
    ) {
        const supplyBN = supply.multipliedBy(10 ** 18);
        const ownerBN = ownerAmount.multipliedBy(10 ** 18);

        return this.buildMethodRunnableMulti(contractAddress,
            (contract, _) => contract.methods.deployHardCapToken(
                name,
                ticker,
                supplyBN.toString(),
                ownerBN.toString(),
                complexTax,
                metadataUrl,
                refCode !== undefined
                    ? Web3.utils.sha3(refCode)
                    : '0x'
            ),
            async () => {
            },
            async () => value.multipliedBy(10 ** 18));
    }

    public async deployBasicToken(
        contractAddress: string,
        name: string,
        ticker: string,
        supply: BigNumber,
        value: BigNumber,
        refCode?: string
    ) {
        const supplyBN = supply.multipliedBy(10 ** 18);

        return this.buildMethodRunnableMulti(contractAddress,
            (contract, _) => contract.methods.deployBasicToken(
                name,
                ticker,
                supplyBN.toString(),
                refCode !== undefined
                    ? Web3.utils.sha3(refCode)
                    : '0x'
            ),
            async () => {
            },
            async () => value.multipliedBy(10 ** 18));
    }

    public async addLiqudityToDexNative(
        contractAddress: string,
        router: string,
        token: string,
        treasury: string,
        tokenAmount: BigNumber,
        nativeAmount: BigNumber
    ): Promise<MethodRunnable> {
        const tokenDecimals = await this.token.decimals(this.walletConnection.blockchain, token) as number;
        const tokenAmountBN = tokenAmount.multipliedBy(10 ** tokenDecimals).decimalPlaces(0);
        const nativeAmountBN = nativeAmount.multipliedBy(10 ** 18).decimalPlaces(0);

        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, connectedAddress) => contract.methods.addLiqudityToDexNative(
                router,
                token,
                treasury,
                tokenAmountBN.toString(),
                nativeAmountBN.toString()
            ),
            async () => {
            },
            async () => nativeAmountBN);
    }

    public async addLiqudityToDexNativeFromWallet(
        contractAddress: string,
        router: string,
        token: string,
        treasury: string,
        tokenAmount: BigNumber,
        nativeAmount: BigNumber
    ): Promise<MethodRunnable> {
        const tokenDecimals = await this.token.decimals(this.walletConnection.blockchain, token) as number;
        const tokenAmountBN = tokenAmount.multipliedBy(10 ** tokenDecimals).decimalPlaces(0);
        const nativeAmountBN = nativeAmount.multipliedBy(10 ** 18).decimalPlaces(0);

        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, _) =>
                contract.methods.addLiqudityToDexNativeFromWallet(
                    router,
                    token,
                    treasury,
                    tokenAmountBN.toString(),
                    nativeAmountBN.toString()
                ),
            async () => {
            },
            async () => nativeAmountBN);
    }

    public upgradeTreasury(contractAddress: string, treasury: string): MethodRunnable {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, connectedAddress) => contract.methods.upgradeTreasury(treasury)
        );
    }

    public upgradeTokenomics(contractAddress: string, tokenomics: string): MethodRunnable {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, connectedAddress) => contract.methods.upgradeTokenomics(tokenomics)
        );
    }

    public upgradeInflation(contractAddress: string, inflation: string): MethodRunnable {
        return this.buildMethodRunnableMulti(
            contractAddress,
            (contract, connectedAddress) => contract.methods.upgradeInflation(inflation));
    }
}
