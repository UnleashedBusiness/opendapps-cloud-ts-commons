import {type Web3DataInterface} from '../base/web3-data.interface.js';
import {BigNumber} from 'bignumber.js';
import {
    BlockchainDefinition,
    EmptyAddress,
    type NumericResult,
    type ReadOnlyWeb3Connection,
} from '@unleashed-business/ts-web3-commons';
import {EventEmitter} from '@unleashed-business/ts-web3-commons/dist/utils/event-emitter.js';
import TokenDeployment from '../../../web2/data/deployment/token-deployment.js';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import {Web3BatchRequest} from 'web3-core';
import {bigNumberPipe, scaleForTokenPipe} from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js';
import type {NftMetadata} from "../../../web2/data/base/nft/nft-metadata.js";

export class TokenData implements Web3DataInterface {
    private static availableRouterCache?: string[];
    private static availableRouterCacheFactories: Record<string, string> = {};
    private static availableRouterCacheWETH: Record<string, string> = {};

    protected _initialLoading = false;
    protected _imageLoading = false;
    private _hasComplexType: boolean = false;
    private _hasInflation: boolean = false;
    private _isOwnedByNFT: boolean = false;
    private _name: string = '';
    private _symbol: string = '';
    private _decimals: number = 18;
    private _totalSupply: BigNumber = new BigNumber(0);
    private _owner: string = '';
    private _ownerName: string = '';
    private _ownerIsCompany: boolean = false;
    private _dexListings: string[] = [];
    private _ownershipCollection = '';
    private _ownershipTokenId = 0;
    private _imageUrl?: string;
    private _inflationUpgradeable: boolean = false;
    private _tokenomicsUpgradeable: boolean = false;
    private _treasuryUpgradeable: boolean = false;
    private _stakingUpgradeable: boolean = false;

    public get address(): string {
        return this.deployment.address;
    }

    public get tokenomics(): string {
        return this.deployment.tokenomics;
    }

    public get treasury(): string {
        return this.deployment.treasury;
    }

    public get inflation(): string {
        return this.deployment.inflation;
    }

    public get imageLoading(): boolean {
        return this._imageLoading;
    }

    public get staking(): string | undefined {
        return this.deployment.staking;
    }

    public get assetBacking(): string | undefined {
        return this.deployment.assetBacking;
    }

    public get imageUrl() {
        return this._imageUrl;
    }

    public get hasComplexType(): boolean {
        return this._hasComplexType;
    }

    public get isOwnedByNFT(): boolean {
        return this._isOwnedByNFT;
    }

    public get hasInflation(): boolean {
        return this._hasInflation;
    }

    public get name(): string {
        return this._name;
    }

    public get symbol(): string {
        return this._symbol;
    }

    public get decimals(): number {
        return this._decimals;
    }

    public get totalSupply(): BigNumber {
        return this._totalSupply;
    }

    public get owner(): string {
        return this._owner;
    }

    public get ownerName(): string {
        return this._ownerName;
    }

    public get ownerIsCompany(): boolean {
        return this._ownerIsCompany;
    }

    public get ownershipCollection(): string {
        return this._ownershipCollection;
    }

    public get ownershipTokenId(): number {
        return this._ownershipTokenId;
    }

    public get dexListings(): string[] {
        return this._dexListings;
    }

    public get inflationUpgradeable(): boolean {
        return this._inflationUpgradeable;
    }

    public get tokenomicsUpgradeable(): boolean {
        return this._tokenomicsUpgradeable;
    }

    public get treasuryUpgradeable(): boolean {
        return this._treasuryUpgradeable;
    }

    public get stakingUpgradeable(): boolean {
        return this._stakingUpgradeable;
    }

    public get hasTreasury(): boolean {
        return this.treasury !== undefined && this.treasury !== EmptyAddress;
    }

    public get hasStaking(): boolean {
        return this.staking !== undefined && this.staking !== EmptyAddress;
    }

    public get hasAssetBacking(): boolean {
        return this.assetBacking !== undefined && this.assetBacking !== EmptyAddress;
    }

    public readonly imageAvailableEvent: EventEmitter<string> = new EventEmitter<string>();

    public constructor(
        public readonly deployment: TokenDeployment,
        protected readonly routerAddress: string,
        protected readonly connection: ReadOnlyWeb3Connection,
        protected readonly web3: Web3ServicesContainer,
        protected readonly web2: HttpServicesContainer,
    ) {
    }

    async load(
        useCaching: boolean,
        config: BlockchainDefinition,
        web3Batch?: Web3BatchRequest,
        timeout?: number,
    ): Promise<void> {
        const batch = web3Batch ?? new (this.connection.getWeb3ReadOnly(config).BatchRequest)();

        let contractDeployer: string;
        let tokenDeployer: string;
        const tokenAsAServiceContract = this.web3.tokenAsAService.readOnlyInstance(config, this.address);

        const initialsBatch = new (this.connection.getWeb3ReadOnly(config).BatchRequest)();
        this.web3.openDAppsCloudRouter.views
            .contractDeployer<string>(config, this.routerAddress, {}, initialsBatch)
            .then((x: string) => (contractDeployer = x));
        this.web3.openDAppsCloudRouter.views
            .tokenAsAServiceDeployer<string>(config, this.routerAddress, {}, initialsBatch)
            .then((x: string) => (tokenDeployer = x));

        tokenAsAServiceContract
            .decimals<NumericResult>({}, initialsBatch)
            .then(bigNumberPipe)
            .then((result) => (this._decimals = result.toNumber()));
        tokenAsAServiceContract.owner({}, initialsBatch).then((x) => (this._owner = x as string));

        if (this._initialLoading || !useCaching) {
            try {
                tokenAsAServiceContract
                    .ownershipCollection({}, initialsBatch)
                    .then((value) => (this._ownershipCollection = value as string));
                tokenAsAServiceContract
                    .isOwnedByNFT<boolean>({}, initialsBatch)
                    .then((value) => (this._isOwnedByNFT = value as boolean));

                await initialsBatch.execute();
            } catch (e) {
                this._isOwnedByNFT = this._ownershipCollection !== EmptyAddress;
            }

            if (this._isOwnedByNFT) {
                tokenAsAServiceContract
                    .ownershipTokenId<NumericResult>({}, batch)
                    .then(bigNumberPipe)
                    .then((result) => this._ownershipTokenId = result.toNumber());

                this._imageLoading = true;
                this.web2.nftProxy
                    .getTokenMetadata(config.networkId, this.address)
                    .then((metadata: NftMetadata) => {
                        if (metadata.image !== '') {
                            this.web2.nftProxy.getTokenImageUrl(config.networkId, this.address)
                                .then((value: string) => {
                                    this._imageUrl = value;
                                    this._imageLoading = false;
                                    this.imageAvailableEvent.emit(value);
                                });
                        } else {
                            this._imageLoading = false;
                        }
                    })
                    .catch(() => {
                        this._imageLoading = false;
                    });
            }
        } else {
            await initialsBatch.execute();
        }

        if (!this.hasTreasury) {
            if (TokenData.availableRouterCache === undefined) {
                TokenData.availableRouterCache = await this.web3.tokenAsAServiceDeployer.views
                    .availableDexRouters<string[]>(config, tokenDeployer!, {});
            }

            const factoryBatch = new (this.connection.getWeb3ReadOnly(config).BatchRequest)();

            for (const routerAddress of TokenData.availableRouterCache) {
                if (TokenData.availableRouterCacheFactories[routerAddress] === undefined) {
                    this.web3.uniswapRouter.views
                        .factory<string>(config, routerAddress, {}, factoryBatch)
                        .then((x: string) => (TokenData.availableRouterCacheFactories[routerAddress] = x));
                }

                if (TokenData.availableRouterCacheWETH[routerAddress] === undefined) {
                    this.web3.uniswapRouter.views
                        .WETH<string>(config, routerAddress, {}, factoryBatch)
                        .then((x: string) => (TokenData.availableRouterCacheWETH[routerAddress] = x));
                }
            }

            await factoryBatch.execute();
        }

        const contractDeployerContract = this.web3.contractDeployer.readOnlyInstance(config, contractDeployer!);

        contractDeployerContract.isUpgradeable<boolean>({_contract: this.tokenomics}, batch)
            .then((result) => this._tokenomicsUpgradeable = result);
        if (this.hasStaking) {
            contractDeployerContract.isUpgradeable<boolean>({_contract: this.staking!}, batch)
                .then((result) => this._stakingUpgradeable = result);
        }
        if (this.hasInflation) {
            contractDeployerContract.isUpgradeable<boolean>({_contract: this.inflation}, batch)
                .then((result) => this._inflationUpgradeable = result);
        }
        if (this.hasTreasury) {
            contractDeployerContract.isUpgradeable<boolean>({_contract: this.treasury}, batch)
                .then((result) => this._treasuryUpgradeable = result);
        }

        this.web3.dymanicTokenomics.views
            .availableTaxableConfigurations<NumericResult>(config, this.tokenomics, {}, batch)
            .then(bigNumberPipe)
            .then((result) => {
                this._hasComplexType = result.toNumber() > 1;
            });

        if (this._initialLoading || !useCaching) {
            tokenAsAServiceContract.symbol({}, batch).then((result) => (this._symbol = result as string));
            tokenAsAServiceContract.name({}, batch).then((result) => (this._name = result as string));
        }
        tokenAsAServiceContract
            .totalSupply<NumericResult>({}, batch)
            .then(bigNumberPipe)
            .then(scaleForTokenPipe(config, this.web3.token, this.address))
            .then((result) => (this._totalSupply = result));

        if (this.hasTreasury) {
            this.web3.tokenLiquidityTreasury.views.getTokenDexListings(config, this.treasury, {}, batch).then((result) => {
                this._dexListings = result as string[];
            });
        } else {
            this._dexListings = [];

            for (const routerAddress of TokenData.availableRouterCache!) {
                this.web3.uniswapRouter.views
                    .getAmountsOut<NumericResult>(
                        config,
                        routerAddress,
                        {
                            amountIn: 10 ** 18,
                            path: [this.address, TokenData.availableRouterCacheWETH[routerAddress]],
                        },
                        batch)
                    .then(() => this._dexListings.push(routerAddress))
                    .catch(() => console.warn(`Token ${this.address} is not listed on dex ${routerAddress}`));
            }
        }

        const promises: Promise<any>[] = [
            this.web3.decentralizedEntityInterface.views
                .name(config, this._owner, {})
                .then((x) => {
                    this._ownerName = x as string;
                    this._ownerIsCompany = true;
                })
                .catch(() => {
                    this._ownerName = 'My Wallet';
                    this._ownerIsCompany = false;
                }),
        ];

        if (web3Batch === undefined) {
            promises.push(batch.execute({timeout: timeout}));
        }

        await Promise.all(promises);
    }
}
