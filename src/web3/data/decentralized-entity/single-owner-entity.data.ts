import {BaseDecentralizedEntityData} from './base/base-decentralized-entity.data.js';
import Web3 from 'web3';
import {BlockchainDefinition, EmptyAddress, type ReadOnlyWeb3Connection} from '@unleashed-business/ts-web3-commons';
import DecentralizedEntityDeployment from '../../../web2/data/deployment/decentralized-entity-deployment.js';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import type {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export class SingleOwnerEntityData extends BaseDecentralizedEntityData {
    private _owner: string = EmptyAddress;

    public override walletRoles(wallet: string): string[] {
        const roles = [];
        if (Web3.utils.toChecksumAddress(this._owner) === Web3.utils.toChecksumAddress(wallet)) {
            roles.push('Owner');
        }
        return roles;
    }

    public override get teamMembersText(): string {
        return '1 Owner';
    }

    public override get votingProposals(): string[] {
        return [];
    }

    public get owner(): string {
        return this._owner;
    }

    constructor(
        deployment: DecentralizedEntityDeployment,
        routerAddress: string,
        connection: ReadOnlyWeb3Connection,
        web3Services: Web3ServicesContainer,
        web2: HttpServicesContainer,
    ) {
        super(deployment, routerAddress, connection, web3Services, web2);
    }

    async loadTypeSpecifics(
        _: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void> {
        await this.web3.singleOwnerEntity.views
            .owner<string>(config, this.address, {}, web3Batch, (result) => this._owner = result);
    }
}
