import {BigNumber} from 'bignumber.js';
import {type Web3DataInterface} from '../../base/web3-data.interface.js';
import DecentralizedEntityDeployment from '../../../../web2/data/deployment/decentralized-entity-deployment.js';
import {
    BlockchainDefinition,
    DefaultEVMNativeTokenDecimals,
    type ReadOnlyWeb3Connection,
} from '@unleashed-business/ts-web3-commons';
import {Web3ServicesContainer} from '../../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../../http-services.container.js';
import {EventEmitter} from '@unleashed-business/ts-web3-commons/dist/utils/event-emitter.js';
import type {NftMetadata} from "../../../../web2/data/base/nft/nft-metadata.js";
import {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export abstract class BaseDecentralizedEntityData implements Web3DataInterface {
    protected _initialLoading = false;
    protected _imageLoading = false;
    protected _teamMembers: string[] = [];

    private _name: string = '';
    private _funds: BigNumber = new BigNumber(0);
    private _imageUrl?: string;
    private _treasuryUpgradeable: boolean = false;

    public get imageLoading(): boolean {
        return this._imageLoading;
    }

    public get address(): string {
        return this.deployment.address;
    }

    public get type(): number {
        return parseInt(this.deployment.type);
    }

    public get rewardsTreasury(): string {
        return this.deployment.treasury;
    }

    public get imageUrl(): string {
        return this._imageUrl!;
    }

    public get name(): string {
        return this._name;
    }

    public get funds(): BigNumber {
        return this._funds;
    }

    public get teamMembers(): string[] {
        return this._teamMembers;
    }

    public get treasuryUpgradeable(): boolean {
        return this._treasuryUpgradeable;
    }

    public abstract get votingProposals(): string[];

    public abstract get teamMembersText(): string;

    public abstract walletRoles(wallet: string): string[];

    public readonly imageAvailableEvent: EventEmitter<string> = new EventEmitter<string>();

    protected constructor(
        public readonly deployment: DecentralizedEntityDeployment,
        protected readonly routerAddress: string,
        protected readonly connection: ReadOnlyWeb3Connection,
        protected readonly web3: Web3ServicesContainer,
        protected readonly web2: HttpServicesContainer,
    ) {
    }

    public async refreshFunds(config: BlockchainDefinition): Promise<void> {
        const fundsNotConverted = await this.connection.getWeb3ReadOnly(config).eth.getBalance(this.address);
        this._funds = new BigNumber(fundsNotConverted.toString()).div(DefaultEVMNativeTokenDecimals);
    }

    public async load(
        useCaching: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
        timeout?: number,
    ): Promise<void> {
        await this.refreshFunds(config);
        const web3Connection = this.connection.getWeb3ReadOnly(config);
        const batch = web3Batch ?? new BatchRequest(web3Connection);

        const loadMetadata = !this._initialLoading || !useCaching;

        const promises: Promise<any>[] = [];

        const [teamMembers, contractDeployer] = await Promise.all([
            this.web2.decentralizedEntity.members(config.networkId, this.address),
            this.web3.openDAppsCloudRouter.views
                .contractDeployer<string>(config, this.routerAddress, {})
                .then(r => r as string),
        ]);
        this._teamMembers = teamMembers;

        if (loadMetadata) {
            this._imageLoading = true;
            this.web2.nftProxy
                .getOrganizationMetadata(config.networkId, this.address)
                .then((metadata: NftMetadata) => {
                    if (metadata.image !== '') {
                        promises.push(
                            this.web2.nftProxy
                                .getOrganizationImageUrl(config.networkId, this.address)
                                .then((value: string) => {
                                    this._imageUrl = value;
                                    this._imageLoading = false;
                                    this.imageAvailableEvent.emit(value);
                                })
                                .catch(() => {
                                    this._imageLoading = false;
                                }),
                        );
                    } else {
                        this._imageLoading = false;
                    }
                })
                .catch(() => {
                    this._imageLoading = false;
                });
        }

        await this.loadTypeSpecifics(useCaching, config, batch);

        await this.web3.contractDeployer.views
            .isUpgradeable<boolean>(config, contractDeployer, {_contract: this.rewardsTreasury}, batch, (result) => (this._treasuryUpgradeable = result));

        await this.web3.decentralizedEntityInterface.views
            .name<string>(config, this.address, {}, batch, (result) => (this._name = result));

        if (web3Batch === undefined) {
            promises.push(batch.execute({timeout: timeout ?? 10_000}));
        }

        await Promise.all(promises);
    }

    public abstract loadTypeSpecifics(
        useCaching: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void>;

    public toBasicData(): { name: string; type: number; address: string } {
        return {
            name: this._name,
            type: this.type,
            address: this.address,
        };
    }
}
