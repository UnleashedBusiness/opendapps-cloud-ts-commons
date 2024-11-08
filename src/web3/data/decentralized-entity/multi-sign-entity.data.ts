import {BaseDecentralizedEntityData} from './base/base-decentralized-entity.data.js';
import Web3 from 'web3';
import {ProposalStateEnum} from '../../enum/proposal-state.enum.js';
import DecentralizedEntityDeployment from '../../../web2/data/deployment/decentralized-entity-deployment.js';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import {BlockchainDefinition, type ReadOnlyWeb3Connection} from '@unleashed-business/ts-web3-commons';
import type {ProposalWithStateData} from "../../../web2/data/multi-sign-proposal/proposal-with-state.data.js";
import type {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export class MultiSignEntityData extends BaseDecentralizedEntityData {
    private _roots: string[] = [];
    private _leafs: string[] = [];
    private _votingProposals: string[] = [];

    public override walletRoles(wallet: string): string[] {
        const roles = [];
        if (this._roots.map((x) => Web3.utils.toChecksumAddress(x)).indexOf(Web3.utils.toChecksumAddress(wallet)) > -1) {
            roles.push('Root Voter');
        }
        if (this._leafs.map((x) => Web3.utils.toChecksumAddress(x)).indexOf(Web3.utils.toChecksumAddress(wallet)) > -1) {
            roles.push('Leaf Voter');
        }
        return roles;
    }

    public override get teamMembersText(): string {
        return this._roots.length + ' Root Voters, ' + this._leafs.length + ' Leaf Voters';
    }

    public override get votingProposals(): string[] {
        return this._votingProposals;
    }

    public get rootSigners(): string[] {
        return this._roots;
    }

    public get leafSigners(): string[] {
        return this._leafs;
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

    public async loadTypeSpecifics(
        _: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void> {
        const entityContract = this.web3.multiSignEntity.readOnlyInstance(config, this.address);

        this._roots = [];
        this._leafs = [];
        for (let i = 0; i < this._teamMembers.length; i++) {
            await entityContract
                .hasRole<boolean>({
                    role: Web3.utils.sha3('MULTISIGN_PROTOCOL_ROOT')!,
                    account: this._teamMembers[i]
                }, web3Batch, (result) => {
                    if (result) {
                        this._roots.push(this._teamMembers[i]);
                    }
                });

            await entityContract
                .hasRole<boolean>({
                    role: Web3.utils.sha3('MULTISIGN_PROTOCOL_LEAF')!,
                    account: this._teamMembers[i]
                }, web3Batch, (result) => {
                    if (result) {
                        this._leafs.push(this._teamMembers[i]);
                    }
                });
        }

        this.web2.multiSignProposal
            .listForCompanyByState(config.networkId, this.address, ProposalStateEnum.Active.valueOf())
            .then((proposalsToVote: ProposalWithStateData[]) => {
                this._votingProposals = proposalsToVote.map((x) => x.proposalId);
            });
    }
}
