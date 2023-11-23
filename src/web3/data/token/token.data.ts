import { Web3DataInterface } from '../base/web3-data.interface';
import BigNumber from 'bignumber.js';
import { BlockchainDefinition, EmptyAddress, ReadOnlyWeb3Connection } from '@unleashed-business/ts-web3-commons';
import { EventEmitter } from '@unleashed-business/ts-web3-commons/dist/utils/event-emitter';
import TokenDeployment from '../../../web2/data/deployment/token-deployment';
import { Web3ServicesContainer } from '../../../web3-services.container';
import { HttpServicesContainer } from '../../../http-services.container';
import { Web3BatchRequest } from 'web3-core';

export class TokenData implements Web3DataInterface {
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
  ) {}

  async load(
    useCaching: boolean,
    config: BlockchainDefinition,
    web3Batch?: Web3BatchRequest,
    timeout?: number,
  ): Promise<void> {
    const batch = web3Batch ?? new (this.connection.getWeb3ReadOnly(config).BatchRequest)();

    let contractDeployer: string;

    const initialPromises = [
      this.web3.openDAppsCloudRouter.contractDeployer(config, this.routerAddress).then((x) => x as string),
      this.web3.tokenAsAService.owner(config, this.address).then((x) => (this._owner = x as string)),
    ];
    if (this._initialLoading || !useCaching) {
      try {
        [, , contractDeployer] = await Promise.all([
          this.web3.tokenAsAService
            .ownershipCollection(config, this.address)
            .then((value) => (this._ownershipCollection = value as string)),
          this.web3.tokenAsAService
            .isOwnedByNFT(config, this.address)
            .then((value) => (this._isOwnedByNFT = value as boolean)),
          ...initialPromises,
        ]);
      } catch (e) {
        this._isOwnedByNFT = this._ownershipCollection !== EmptyAddress;
      }

      if (this._isOwnedByNFT) {
        await this.web3.tokenAsAService.ownershipTokenId(config, this.address, batch, (result) => {
          this._ownershipTokenId = result;
        });

        this._imageLoading = true;
        this.web2.nftProxy
          .getTokenMetadata(config.networkId, this.address)
          .then((metadata) => {
            if (metadata.image !== '') {
              this.web2.nftProxy.getTokenImageUrl(config.networkId, this.address).then((value) => {
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
      [contractDeployer] = await Promise.all(initialPromises);
    }

    this._hasInflation = EmptyAddress !== this.deployment.inflation;
    if (this._hasInflation) {
      await this.web3.contractDeployer.isUpgradeable(config, contractDeployer, this.inflation, batch, (result) => {
        this._inflationUpgradeable = result;
      });
    }
    await this.web3.contractDeployer.isUpgradeable(config, contractDeployer, this.tokenomics, batch, (result) => {
      this._tokenomicsUpgradeable = result;
    });
    await this.web3.contractDeployer.isUpgradeable(config, contractDeployer, this.treasury, batch, (result) => {
      this._treasuryUpgradeable = result;
    });

    if (this.hasStaking) {
      await this.web3.contractDeployer.isUpgradeable(config, contractDeployer, this.staking!, batch, (result) => {
        this._stakingUpgradeable = result;
      });
    }
    await this.web3.dymanicTokenomics.availableTaxableConfigurations(config, this.tokenomics, batch, (result) => {
      this._hasComplexType = result > 1;
    });

    if (this._initialLoading || !useCaching) {
      await this.web3.token.symbol(config, this.address, batch, (result) => (this._symbol = result));
      await this.web3.token.decimals(config, this.address, batch, (result) => (this._decimals = result));
      await this.web3.token.name(config, this.address, batch, (result) => (this._name = result));
    }
    await this.web3.token.totalSupply(config, this.address, batch, (result) => (this._totalSupply = result));
    if (this.hasTreasury) {
      await this.web3.tokenLiquidityTreasury.getTokenDexListings(config, this.treasury, batch, (result) => {
        this._dexListings = result;
      });
    }

    const promises: Promise<any>[] = [
      this.web3.decentralizedEntityInterface
        .name(config, this._owner)
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
      promises.push(batch.execute({ timeout: timeout }));
    }

    await Promise.all(promises);
  }
}
