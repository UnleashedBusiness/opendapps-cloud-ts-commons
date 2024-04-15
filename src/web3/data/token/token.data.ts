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
import type {NftMetadata} from "../../../web2/data/base/nft/nft-metadata.js";
import {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";

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
        web3Batch?: BatchRequest,
        timeout?: number,
    ): Promise<void> {
        const web3Connection = this.connection.getWeb3ReadOnly(config);
        const batch = web3Batch ?? new BatchRequest(web3Connection);

        let contractDeployer: string;
        let tokenDeployer: string;
        const tokenAsAServiceContract = this.web3.tokenAsAService.readOnlyInstance(config, this.address);

        const initialsBatch = new BatchRequest(web3Connection);
        await this.web3.openDAppsCloudRouter.views
            .contractDeployer<string>(config, this.routerAddress, {}, initialsBatch, x => (contractDeployer = x));
        await this.web3.openDAppsCloudRouter.views
            .tokenAsAServiceDeployer<string>(config, this.routerAddress, {}, initialsBatch, x => (tokenDeployer = x));

        await tokenAsAServiceContract
            .decimals<NumericResult>({}, initialsBatch, result => this._decimals = bn_wrap(result).toNumber());
        await tokenAsAServiceContract.owner<string>({}, initialsBatch, x => this._owner = x);

        if (this._initialLoading || !useCaching) {
            try {
                await tokenAsAServiceContract
                    .ownershipCollection({}, initialsBatch, (value) => (this._ownershipCollection = value as string));
                await tokenAsAServiceContract
                    .isOwnedByNFT<boolean>({}, initialsBatch, (value) => (this._isOwnedByNFT = value as boolean));

                await initialsBatch.execute({timeout: 10_000});
            } catch (e) {
                this._isOwnedByNFT = this._ownershipCollection !== EmptyAddress;
            }

            if (this._isOwnedByNFT) {
                await tokenAsAServiceContract
                    .ownershipTokenId<NumericResult>({}, batch, (result) => this._ownershipTokenId = bn_wrap(result).toNumber());

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
            await initialsBatch.execute({timeout: 10_000});
        }

        if (!this.hasTreasury) {
            if (TokenData.availableRouterCache === undefined) {
                TokenData.availableRouterCache = await this.web3.tokenAsAServiceDeployer.views
                    .availableDexRouters<string[]>(config, tokenDeployer!, {}) as string[];
            }

            const factoryBatch = new BatchRequest(web3Connection);

            for (const routerAddress of TokenData.availableRouterCache) {
                if (TokenData.availableRouterCacheFactories[routerAddress] === undefined) {
                    await this.web3.uniswapRouter.views
                        .factory<string>(config, routerAddress, {}, factoryBatch, x => (TokenData.availableRouterCacheFactories[routerAddress] = x));
                }

                if (TokenData.availableRouterCacheWETH[routerAddress] === undefined) {
                    await this.web3.uniswapRouter.views
                        .WETH<string>(config, routerAddress, {}, factoryBatch, x => (TokenData.availableRouterCacheWETH[routerAddress] = x));
                }
            }

            await factoryBatch.execute({timeout: 10_000});
        }

        const contractDeployerContract = this.web3.contractDeployer.readOnlyInstance(config, contractDeployer!);

        await contractDeployerContract.isUpgradeable<boolean>({_contract: this.tokenomics}, batch, (result) => this._tokenomicsUpgradeable = result);
        if (this.hasStaking) {
            await contractDeployerContract.isUpgradeable<boolean>({_contract: this.staking!}, batch, (result) => this._stakingUpgradeable = result);
        }
        if (this.hasInflation) {
            await contractDeployerContract.isUpgradeable<boolean>({_contract: this.inflation}, batch, (result) => this._inflationUpgradeable = result);
        }
        if (this.hasTreasury) {
            await contractDeployerContract.isUpgradeable<boolean>({_contract: this.treasury}, batch, (result) => this._treasuryUpgradeable = result);
        }

        await this.web3.dymanicTokenomics.views
            .availableTaxableConfigurations<NumericResult>(config, this.tokenomics, {}, batch, (result) => {
                this._hasComplexType = bn_wrap(result).toNumber() > 1;
            });

        if (this._initialLoading || !useCaching) {
            await tokenAsAServiceContract.symbol({}, batch, (result) => (this._symbol = result as string));
            await tokenAsAServiceContract.name({}, batch, (result) => (this._name = result as string));
        }
        await tokenAsAServiceContract
            .totalSupply<NumericResult>({}, batch, (result) => (this._totalSupply = bn_wrap(result).dividedBy(10 ** this._decimals)));

        if (this.hasTreasury) {
            await this.web3.tokenLiquidityTreasury.views.getTokenDexListings(config, this.treasury, {}, batch, (result) => {
                this._dexListings = result as string[];
            });
        } else {
            this._dexListings = [];

            for (const routerAddress of TokenData.availableRouterCache!) {
                await this.web3.uniswapRouter.views
                    .getAmountsOut<NumericResult>(
                        config,
                        routerAddress,
                        {
                            amountIn: (10 ** 18).toFixed(),
                            path: [this.address, TokenData.availableRouterCacheWETH[routerAddress]],
                        },
                        batch,
                        () => this._dexListings.push(routerAddress))
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
            promises.push(batch.execute({timeout: timeout ?? 10_000}));
        }

        await Promise.all(promises);
    }
}
