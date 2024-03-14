import {BaseDecentralizedEntityData} from './base/base-decentralized-entity.data.js';
import Web3 from 'web3';
import {ProposalStateEnum} from '../../enum/proposal-state.enum.js';
import DecentralizedEntityDeployment from '../../../web2/data/deployment/decentralized-entity-deployment.js';
import {Web3ServicesContainer} from '../../../web3-services.container.js';
import {HttpServicesContainer} from '../../../http-services.container.js';
import {
    BlockchainDefinition,
    type NumericResult,
    type ReadOnlyWeb3Connection
} from '@unleashed-business/ts-web3-commons';
import type {ProposalWithStateData} from "../../../web2/data/multi-sign-proposal/proposal-with-state.data.js";
import type {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";

export class MultiSignSharesEntityData extends BaseDecentralizedEntityData {
    private _holderShares: number[] = [];
    private _holderSharesMap: { [index: string]: number } = {};
    private _votingProposals: string[] = [];
    private _totalShares = 0;

    public get holderShares(): number[] {
        return this._holderShares;
    }

    public get holderSharesMap(): { [index: string]: number } {
        return this._holderSharesMap;
    }

    public get totalShares(): number {
        return this._totalShares;
    }

    public override walletRoles(wallet: string): string[] {
        const roles = [];
        let index = -1;
        if (
            (index = this._teamMembers
                .map((x) => Web3.utils.toChecksumAddress(x))
                .indexOf(Web3.utils.toChecksumAddress(wallet))) > -1
        ) {
            roles.push((this._holderShares[index] / this._totalShares) * 100 + '% Shareholder');
        }
        return roles;
    }

    public override get teamMembersText(): string {
        return this._teamMembers.length + ' Shareholders';
    }

    public override get votingProposals(): string[] {
        return this._votingProposals;
    }

    constructor(
        deployment: DecentralizedEntityDeployment,
        routerAddress: string,
        connection: ReadOnlyWeb3Connection,
        web3: Web3ServicesContainer,
        web2: HttpServicesContainer,
    ) {
        super(deployment, routerAddress, connection, web3, web2);
    }

    async loadTypeSpecifics(
        _: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void> {
        const ownershipCollectionContract = this.web3.ownershipSharesNFTCollection.readOnlyInstance(
            config,
            this.deployment.ownershipCollection!,
        );
        await ownershipCollectionContract
            .totalSupply<NumericResult>({id: this.deployment.tokenId!}, web3Batch, (result) => {
                this._totalShares = bn_wrap(result).toNumber();
            });

        for (let i = 0; i < this._teamMembers.length; i++) {
            await ownershipCollectionContract
                .balanceOf<NumericResult>({
                    id: this.deployment.tokenId!,
                    account: this._teamMembers[i]
                }, web3Batch, (result) => {
                    const resultBN = bn_wrap(result);
                    this._holderShares.push(resultBN.toNumber());
                    this._holderSharesMap[this._teamMembers[i]] = resultBN.toNumber();
                });
        }

        this.web2.multiSignProposal
            .listForCompanyByState(config.networkId, this.address, ProposalStateEnum.Active.valueOf())
            .then((proposalsToVote: ProposalWithStateData[]) => {
                this._votingProposals = proposalsToVote.map((x) => x.proposalId);
            });
    }
}
