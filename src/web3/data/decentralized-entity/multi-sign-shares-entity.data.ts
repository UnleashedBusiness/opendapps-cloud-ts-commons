import {BaseDecentralizedEntityData} from "./base/base-decentralized-entity.data";
import Web3 from "web3";
import {ProposalStateEnum} from "../../enum/proposal-state.enum";
import DecentralizedEntityDeployment from "../../../web2/data/deployment/decentralized-entity-deployment";
import {WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import {Web3BatchRequest} from "web3-core";

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

    public override get connectedWalletRoles(): string[] {
        const roles = [];
        let index = -1;
        if ((index = this._teamMembers.map(x => Web3.utils.toChecksumAddress(x)).indexOf(Web3.utils.toChecksumAddress(this.connection.accounts[0]))) > -1) {
            roles.push((this._holderShares[index] / this._totalShares * 100) + "% Shareholder");
        }
        return roles;
    };

    public override get teamMembersText(): string {
        return this._teamMembers.length + " Shareholders";
    }

    public override get votingProposals(): string[] {
        return this._votingProposals;
    }


    constructor(
        deployment: DecentralizedEntityDeployment,
        routerAddress: string,
        connection: WalletConnectionService,
        web3Services: Web3ServicesContainer,
        web2: HttpServicesContainer
    ) {
        super(deployment, routerAddress, connection, web3Services, web2);
    }

    async loadTypeSpecifics(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        const web3Config = this.connection.blockchain;

        const ownershipCollection = await this.web3Services
            .multiSignSharesEntity
            .ownershipCollection(web3Config, this.address) as string;
        const ownershipToken = await this.web3Services
            .multiSignSharesEntity
            .ownershipTokenId(web3Config, this.address) as number;

        await this.web3Services
            .ownershipSharesNFTCollection
            .totalShares(
                web3Config, ownershipCollection, ownershipToken, web3Batch,
                result => {
                    this._totalShares = result
                });

        for (let i = 0; i < this._teamMembers.length; i++) {
            await this.web3Services
                .ownershipSharesNFTCollection
                .balanceOf(
                    web3Config, ownershipCollection, this._teamMembers[i], ownershipToken, web3Batch,
                    result => {
                        this._holderShares.push(result);
                        this._holderSharesMap[this._teamMembers[i]] = result;
                    });
        }

        this.web2.multiSignProposal.listForCompanyByState(
            this.connection.blockchain.networkId,
            this.address,
            ProposalStateEnum.Active.valueOf()
        ).then(proposalsToVote => {
            this._votingProposals = proposalsToVote.map(x => x.proposalId);
        });
    }
}
