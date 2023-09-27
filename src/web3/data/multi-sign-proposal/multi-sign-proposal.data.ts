import {GovernanceProposalData, GovernanceProposalSignatureType} from "./base/governance-proposal.data";
import {ProposalWithStateData} from "../../../web2/data/multi-sign-proposal/proposal-with-state.data";
import {WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import {Web3BatchRequest} from "web3-core";

export class MultiSignProposalData extends GovernanceProposalData {
    private availableRootSignaturesCount = 0;
    private availableTotalSignaturesCount = 0;
    private requiredRootSignaturesCount = 0;
    private requiredTotalSignaturesCount = 0;
    private currentRootSignaturesCount = 0;
    private currentTotalSignaturesCount = 0;

    private isConnectedRoot = false;
    private isConnectedVoter = false;
    private hasConnectedVoted = false;


    constructor(proposal: ProposalWithStateData, connection: WalletConnectionService, web3: Web3ServicesContainer, web2: HttpServicesContainer) {
        super(proposal, connection, web3, web2);
    }

    public override get voteSignatures(): GovernanceProposalSignatureType[] {
        return [
            {
                type: 'Root Signatures',
                requiredPercent: this.availableRootSignaturesCount > 0 ? this.requiredRootSignaturesCount / this.availableRootSignaturesCount : 0,
                currentPercent: this.availableRootSignaturesCount > 0 ? this.currentRootSignaturesCount / this.availableRootSignaturesCount : 0,
            },
            {
                type: 'Total Signatures (Root + Leaf)',
                requiredPercent: this.availableTotalSignaturesCount > 0 ? this.requiredTotalSignaturesCount / this.availableTotalSignaturesCount : 0,
                currentPercent: this.availableTotalSignaturesCount > 0 ? this.currentTotalSignaturesCount / this.availableTotalSignaturesCount : 0,
            }
        ];
    }

    public override get canConnectedExecute(): boolean {
        return this.isConnectedRoot;
    }

    public override get canConnectedVote(): boolean {
        return this.isConnectedVoter;
    }

    public override get hasConnectedVote(): boolean {
        return this.hasConnectedVoted
    }

    public override get newMembersList(): string[] {
        return this.proposal.methodCallList
            .map(x => {
                return {
                    method: x.methodCallAbi.substring(0, x.methodCallAbi.indexOf('(')),
                    args: x.methodCallAbi.substring(x.methodCallAbi.indexOf('(') + 1, x.methodCallAbi.indexOf(')'))
                }
            })
            .filter(x => ['promoteRoot', 'promoteLeaf'].filter(y => y == x.method).length > 0)
            .map(x => x.args);
    }

    protected async loadAdditionalData(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        const config = this.connection.blockchain;

        await this.web3
            .multiSignEntity
            .requiredRootSignatures(
                config, this.proposal.companyAddress, web3Batch,
                result => {
                    this.requiredRootSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .requiredTotalSignatures(
                config, this.proposal.companyAddress, web3Batch,
                result => {
                    this.requiredTotalSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .availableRootSignatures(
                config, this.proposal.companyAddress, web3Batch,
                result => {
                    this.availableRootSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .availableTotalSignatures(
                config, this.proposal.companyAddress, web3Batch,
                result => {
                    this.availableTotalSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .currentRootSignatures(
                config, this.proposal.companyAddress, this.proposal.proposalId, web3Batch,
                result => {
                    this.currentRootSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .currentTotalSignatures(
                config, this.proposal.companyAddress, this.proposal.proposalId, web3Batch,
                result => {
                    this.currentTotalSignaturesCount = result
                });
        await this.web3
            .multiSignEntity
            .hasVoted(
                config, this.proposal.companyAddress, this.proposal.proposalId, this.connection.accounts[0], web3Batch,
                result => {
                    this.hasConnectedVoted = result
                });
        await this.web3
            .multiSignEntity
            .hasRole(
                config, this.proposal.companyAddress, 'MULTISIGN_PROTOCOL_ROOT', this.connection.accounts[0], web3Batch,
                result => {
                    this.isConnectedRoot = result
                });
        await this.web3
            .multiSignEntity
            .hasRole(
                config, this.proposal.companyAddress, 'MULTISIGN_PROTOCOL_LEAF', this.connection.accounts[0], web3Batch,
                result => {
                    this.isConnectedRoot = this.isConnectedVoter = this.isConnectedRoot || result
                });
    }
}
