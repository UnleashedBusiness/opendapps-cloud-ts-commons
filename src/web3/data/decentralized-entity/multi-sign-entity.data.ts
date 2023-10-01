import {BaseDecentralizedEntityData} from "./base/base-decentralized-entity.data";
import Web3 from "web3";
import {ProposalStateEnum} from "../../enum/proposal-state.enum";
import DecentralizedEntityDeployment from "../../../web2/data/deployment/decentralized-entity-deployment";
import {WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import {Web3BatchRequest} from "web3-core";

export class MultiSignEntityData extends BaseDecentralizedEntityData {
    private _roots: string[] = [];
    private _leafs: string[] = [];
    private _votingProposals: string[] = [];

    public override get connectedWalletRoles(): string[]{
        const roles = [];
        if (this._roots.map(x => Web3.utils.toChecksumAddress(x)).indexOf(Web3.utils.toChecksumAddress(this.connection.accounts[0])) > -1) {
            roles.push("Root Voter");
        }
        if (this._leafs.map(x => Web3.utils.toChecksumAddress(x)).indexOf(Web3.utils.toChecksumAddress(this.connection.accounts[0])) > -1) {
            roles.push("Leaf Voter");
        }
        return roles;
    }

    public override get teamMembersText(): string {
        return this._roots.length + " Root Voters, " + this._leafs.length + " Leaf Voters";
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
        connection: WalletConnectionService,
        web3Services: Web3ServicesContainer,
        web2: HttpServicesContainer
    ) {
        super(deployment, routerAddress, connection, web3Services, web2);
    }

    public async loadTypeSpecifics(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        const web3Config = this.connection.blockchain;

        for (let i = 0; i < this._teamMembers.length; i++) {
            await this.web3Services
                .multiSignEntity
                .hasRole(web3Config, this.address, 'MULTISIGN_PROTOCOL_ROOT', this._teamMembers[i], web3Batch,
                    result => {
                        if (result) {
                            this._roots.push(this._teamMembers[i])
                        }
                    }
                );

            await this.web3Services
                .multiSignEntity
                .hasRole(web3Config, this.address, 'MULTISIGN_PROTOCOL_LEAF', this._teamMembers[i], web3Batch,
                    result => {
                        if (result) {
                            this._leafs.push(this._teamMembers[i])
                        }
                    }
                )
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
