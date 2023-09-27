import BigNumber from "bignumber.js";
import {Web3DataInterface} from "../../base/web3-data.interface";
import DecentralizedEntityDeployment from "../../../../web2/data/deployment/decentralized-entity-deployment";
import {DefaultEVMNativeTokenDecimals, WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";
import {NftMetadata} from "../../../../web2/data/base/nft/nft-metadata";
import {Web3ServicesContainer} from "../../../../web3-services.container";
import {HttpServicesContainer} from "../../../../http-services.container";
import {EventEmitter} from "@unleashed-business/ts-web3-commons/dist/utils/event-emitter";

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
        return this.deployment.address
    }

    public get type(): number {
        return this.deployment.type;
    }

    public get rewardsTreasury(): string {
        return this.deployment.treasury;
    }

    public get imageUrl(): string {
        return this._imageUrl
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
    public abstract get connectedWalletRoles(): string[];

    public readonly loadedEvent: EventEmitter<void> = new EventEmitter();
    public readonly imageAvailableEvent: EventEmitter<string> = new EventEmitter<string>();

    protected constructor(
        public readonly deployment: DecentralizedEntityDeployment,
        protected readonly routerAddress: string,
        protected readonly connection: WalletConnectionService,
        protected readonly web3Services: Web3ServicesContainer,
        protected readonly web2: HttpServicesContainer
    ) {
    }


    public async refreshFunds(): Promise<void> {
        const fundsNotConverted = await this.connection.web3.eth.getBalance(this.address);
        this._funds = new BigNumber(fundsNotConverted.toString()).div(DefaultEVMNativeTokenDecimals);
    }

    public async load(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        await this.refreshFunds();
        const web3Config = this.connection.blockchain;
        const batch = web3Batch ?? new this.connection.web3.BatchRequest();

        const loadMetadata = !this._initialLoading || !useCaching;
        let asyncCounter = 0;
        const maxCounter = 1;
        const asyncCallback = () => {
            asyncCounter++;
            if (asyncCounter >= maxCounter) {
                this._initialLoading = true;
                this.loadedEvent.emit();
            }
        };

        if (loadMetadata) {
            this._imageLoading = true;
            this.web2.nftProxy.getOrganizationMetadata(web3Config.networkId, this.address).then((metadata: NftMetadata) => {
                if (metadata.image !== '') {
                    this.web2.nftProxy.getOrganizationImageUrl(web3Config.networkId, this.address).then(value => {
                        this._imageUrl = value;
                        this._imageLoading = false;
                        this.imageAvailableEvent.emit(value);
                    });
                } else {
                    this._imageLoading = false;
                }
            }).catch(() => {
                this._imageLoading = false;
            });
        }

        this._teamMembers = await this.web2.decentralizedEntity.members(web3Config.networkId, this.address);
        await this.loadTypeSpecifics(useCaching, batch);

        const contractDeployer = await this.web3Services
            .openDAppsCloudRouter
            .contractDeployer(web3Config, this.routerAddress) as string;
        await this.web3Services.contractDeployer.isUpgradeable(
            web3Config, contractDeployer, this.rewardsTreasury, batch, result => this._treasuryUpgradeable = result
        );
        await this.web3Services
            .decentralizedEntityInterface
            .name(web3Config, this.address, batch, result => {
                this._name = result;
                asyncCallback();
            });
        if (web3Batch === undefined)
            await batch.execute();
    }

    public abstract loadTypeSpecifics(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void>;

    public toBasicData(): { name: string, type: number, address: string } {
        return {
            name: this._name,
            type: this.type,
            address: this.address
        }
    }
}
