import {type Web3DataInterface} from '../base/web3-data.interface.js';
import {BigNumber} from 'bignumber.js';
import {
    BlockchainDefinition,
    EmptyAddress,
    type FunctionalAbiInstanceViews,
    type NumericResult,
    type ReadOnlyWeb3Connection,
} from '@unleashed-business/ts-web3-commons';
import {EventEmitter} from '@unleashed-business/ts-web3-commons/dist/utils/event-emitter.js';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import {Web3BatchRequest} from 'web3-core';
import {bigNumberPipe, scalePipe} from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js';
import {PresaleDeployment} from '../../../web2/data/deployment/presale-deployment.js';
import {bn_wrap} from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import {
    type PresaleServiceAbiFunctional
} from '@unleashed-business/opendapps-cloud-ts-abi/dist/abi/presale-service.abi.js';
import type {NftMetadata} from "../../../web2/data/base/nft/nft-metadata.js";

export class PresaleData implements Web3DataInterface {
    private static _decimalCache: Record<string, number> = {};

    protected _initialLoading = false;
    private _imageLoading = false;

    private _imageUrl?: string;
    private _owner = '';
    private _isRunning = false;
    private _isFinished = false;
    private _isScheduled = false;
    private _isSuccessful = false;
    private _isExternalToken = false;

    private _forToken: TokenShortInfo = new TokenShortInfo();
    private _purchaseToken: TokenShortInfo = new TokenShortInfo();

    private _exchangeScaling: number = 1;

    private _minBlockStartDistance: BigNumber = new BigNumber(0);
    private _minBlockDuration: BigNumber = new BigNumber(0);
    private _startBlock?: BigNumber = undefined;
    private _endBlock?: BigNumber = undefined;

    private _softCap?: BigNumber = undefined;
    private _hardCap?: BigNumber = undefined;
    private _currentCap?: BigNumber = undefined;
    private _exchangeRate?: BigNumber = undefined;
    private _availableTokens?: BigNumber = undefined;

    private _maxPerWallet?: BigNumber = undefined;
    private _minPerWallet?: BigNumber = undefined;

    public get address(): string {
        return this.deployment.address;
    }

    get imageLoading(): boolean {
        return this._imageLoading;
    }

    get imageUrl(): string {
        return this._imageUrl ?? '';
    }

    get owner(): string {
        return this._owner;
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    get isFinished(): boolean {
        return this._isFinished;
    }

    get isScheduled(): boolean {
        return this._isScheduled;
    }

    get isSuccessful(): boolean {
        return this._isSuccessful;
    }

    get isExternalToken(): boolean {
        return this._isExternalToken;
    }

    get forToken(): TokenShortInfo {
        return this._forToken;
    }

    get purchaseToken(): TokenShortInfo {
        return this._purchaseToken;
    }

    get exchangeScaling(): number {
        return this._exchangeScaling;
    }

    get minBlockStartDistance(): BigNumber {
        return this._minBlockStartDistance;
    }

    get minBlockDuration(): BigNumber {
        return this._minBlockDuration;
    }

    get startBlock(): BigNumber {
        return this._startBlock!;
    }

    get endBlock(): BigNumber {
        return this._endBlock!;
    }

    get softCap(): BigNumber {
        return this._softCap!;
    }

    get hardCap(): BigNumber {
        return this._hardCap!;
    }

    get currentCap(): BigNumber {
        return this._currentCap!;
    }

    get exchangeRate(): BigNumber {
        return this._exchangeRate!;
    }

    get availableTokens(): BigNumber {
        return this._availableTokens!;
    }

    get maxPerWallet(): BigNumber {
        return this._maxPerWallet!;
    }

    get minPerWallet(): BigNumber {
        return this._minPerWallet!;
    }

    public readonly imageAvailableEvent: EventEmitter<string> = new EventEmitter<string>();

    public constructor(
        public readonly deployment: PresaleDeployment,
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
        extended?: boolean,
    ): Promise<void> {
        const batch = web3Batch ?? new (this.connection.getWeb3ReadOnly(config).BatchRequest)();
        const loadAll = extended ?? false;

        let presaleDeployer: string;
        const presaleContract = this.web3.presaleService.readOnlyInstance(config, this.deployment.address);
        const initialBatch = new (this.connection.getWeb3ReadOnly(config).BatchRequest)();

        if (this._initialLoading || !useCaching) {
            this._forToken.address = this.deployment.token;
            this._forToken.decimals = await this.getTokenDecimals(config, this._forToken.address);

            presaleContract.isExternalToken<boolean>({}, batch)
                .then((x: boolean) => {
                    this._isExternalToken = x as boolean;
                    this._imageLoading = true;

                    this.web2.nftProxy
                        .getTokenMetadata(config.networkId, this._forToken.address)
                        .then((metadata: NftMetadata) => {
                            if (metadata.image !== '') {
                                this.web2.nftProxy.getTokenImageUrl(config.networkId, this._forToken.address)
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
                });

            if (loadAll) {
                presaleContract
                    .EXCHANGE_RATE_SCALING<NumericResult>({}, initialBatch)
                    .then(bigNumberPipe)
                    .then((result: BigNumber) => this._exchangeScaling = result.toNumber());
                presaleContract.purchaseToken<string>({}, initialBatch)
                    .then((x: string) => (this._purchaseToken.address = x));
            }
        }
        presaleContract
            .startBlock<NumericResult>({}, loadAll ? initialBatch : batch)
            .then(bigNumberPipe)
            .then((x: BigNumber) => {
                this._isScheduled = x.gt(0);
                if (this._isScheduled) {
                    this._startBlock = x;
                }
            });

        if (loadAll) {
            this.web3.openDAppsCloudRouter.views
                .presaleServiceDeployer<string>(config, this.routerAddress, {}, initialBatch)
                .then((x: string) => (presaleDeployer = x));

            await Promise.all([initialBatch.execute({timeout: timeout})]);
        }

        if (loadAll && (this._initialLoading || !useCaching)) {
            const presaleDeployerContract = this.web3.presaleServiceDeployer.readOnlyInstance(config, presaleDeployer!);

            presaleDeployerContract
                .minBlocksForStart<NumericResult>({}, batch)
                .then(bigNumberPipe)
                .then((x: BigNumber) => (this._minBlockStartDistance = x));
            presaleDeployerContract
                .minBlocksDuration<NumericResult>({}, batch)
                .then(bigNumberPipe)
                .then((x: BigNumber) => (this._minBlockDuration = x));
        }

        presaleContract
            .endBlock<NumericResult>({}, batch)
            .then(bigNumberPipe)
            .then((x: BigNumber) => {
                this._endBlock = x;
            });
        presaleContract.isRunning<boolean>({}, batch).then((x: boolean) => (this._isRunning = x));
        presaleContract.ended<boolean>({}, batch).then((x: boolean) => (this._isFinished = x));
        presaleContract.reachedSoftCap<boolean>({}, batch).then((x: boolean) => (this._isSuccessful = x));

        if (this._initialLoading || !useCaching) {
            this.web3.token.views
                .name<string>(config, this._forToken.address, {}, batch)
                .then((x: string) => (this._forToken.name = x));
            this.web3.token.views
                .symbol<string>(config, this._forToken.address, {}, batch)
                .then((x: string) => (this._forToken.symbol = x));
        }

        this.web3.token.views
            .balanceOf<NumericResult>(config, this._forToken.address, {account: this.address}, batch)
            .then(bigNumberPipe)
            .then(scalePipe(bn_wrap(10 ** this._forToken.decimals)))
            .then((x: BigNumber) => this._availableTokens = x);
        this.web3.token.views
            .totalSupply<NumericResult>(config, this._forToken.address, {}, batch)
            .then(bigNumberPipe)
            .then(scalePipe(bn_wrap(10 ** this._forToken.decimals)))
            .then((x: BigNumber) => this._forToken.totalSupply = x);

        if (loadAll && (this._initialLoading || !useCaching)) {
            this.web3.tokenAsAService.views
                .owner(config, this._forToken.address, {}, batch)
                .then((x) => (this._owner = x as string));
        }

        if (loadAll) {
            if (this._purchaseToken.address !== EmptyAddress) {
                if (this._initialLoading || !useCaching) {
                    this.web3.token.views
                        .name<string>(config, this._purchaseToken.address, {}, batch)
                        .then((x: string) => (this._purchaseToken.name = x));
                    this.web3.token.views
                        .symbol<string>(config, this._purchaseToken.address, {}, batch)
                        .then((x: string) => (this._purchaseToken.symbol = x));

                    this._purchaseToken.decimals = await this.getTokenDecimals(config, this._purchaseToken.address);
                }
            } else {
                this._purchaseToken.symbol = config.networkSymbol;
                this._purchaseToken.name = 'Native Token';
                this._purchaseToken.totalSupply = new BigNumber('100000000');
                this._purchaseToken.decimals = 18;
            }

            this.loadPurchaseTokenStuff(presaleContract, batch);
        }

        if (web3Batch === undefined) {
            await batch.execute({timeout: timeout});
        }
        this._initialLoading = false;
    }

    private loadPurchaseTokenStuff(
        presaleContract: FunctionalAbiInstanceViews<PresaleServiceAbiFunctional>,
        purchaseTokenDecimalsBatch: Web3BatchRequest,
    ): void {
        if (this._isScheduled) {
            presaleContract
                .exchangeRate<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(this._exchangeScaling)))
                .then((x) => (this._exchangeRate = x));

            presaleContract
                .softCap<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(10 ** this._purchaseToken.decimals)))
                .then((x) => (this._softCap = x));
            presaleContract
                .hardCap<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(10 ** this._purchaseToken.decimals)))
                .then((x) => (this._hardCap = x));
            presaleContract
                .currentCap<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(10 ** this._purchaseToken.decimals)))
                .then((x) => (this._currentCap = x));
            presaleContract
                .minPerWallet<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(10 ** this._purchaseToken.decimals)))
                .then((x) => (this._minPerWallet = x));
            presaleContract
                .maxPerWallet<NumericResult>({}, purchaseTokenDecimalsBatch)
                .then(bigNumberPipe)
                .then(scalePipe(bn_wrap(10 ** this._purchaseToken.decimals)))
                .then((x) => (this._maxPerWallet = x));
        }
    }

    private async getTokenDecimals(config: BlockchainDefinition, token: string): Promise<number> {
        if (typeof PresaleData._decimalCache[token] === "undefined") {
            PresaleData._decimalCache[token] = await this.web3.token.views.decimals<NumericResult>(config, token, {})
                .then(bigNumberPipe)
                .then((value: BigNumber) => value.toNumber());
        }
        return PresaleData._decimalCache[token];
    }
}

export class TokenShortInfo {
    public address = '';
    public name = '';
    public symbol = '';
    public decimals = 0;
    public totalSupply?: BigNumber = undefined;
}
