import {ProposalWithStateData} from "../../../../web2/data/multi-sign-proposal/proposal-with-state.data";
import {EventEmitter} from "@unleashed-business/ts-web3-commons/dist/utils/event-emitter";
import {HttpServicesContainer} from "../../../../http-services.container";
import {WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../../web3-services.container";
import {Web3BatchRequest} from "web3-core";
import BigNumber from "bignumber.js";
import {FMT_BYTES, FMT_NUMBER} from "web3-types";

export abstract class GovernanceProposalData {
    private _state: number = 0;
    private _votingStartBlock: number = 0;
    private _votingStartBlockDiff: number = 0;
    private _votingEndBlock: number = 0;
    private _votingEndBlockDiff: number = 0;

    public readonly loadedEvent: EventEmitter<void> = new EventEmitter<void>();

    public get state(): number {
        return this._state;
    }

    public get votingStartBlock(): number {
        return this._votingStartBlock;
    }

    public get votingStartBlockDiff(): number {
        return this._votingStartBlockDiff;
    }

    public get votingEndBlock(): number {
        return this._votingEndBlock;
    }

    public get votingEndBlockDiff(): number {
        return this._votingEndBlockDiff;
    }

    public abstract get voteSignatures(): GovernanceProposalSignatureType[];

    public abstract get canConnectedVote(): boolean;

    public abstract get hasConnectedVote(): boolean;

    public abstract get canConnectedExecute(): boolean;

    public abstract get newMembersList(): string[];

    protected constructor(
        public readonly proposal: ProposalWithStateData,
        protected readonly connection: WalletConnectionService,
        protected readonly web3: Web3ServicesContainer,
        protected readonly web2: HttpServicesContainer,
    ) {
    }

    async load(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        const web3Config = this.connection.blockchain;

        const currentBlock = new BigNumber(await this.connection.web3.eth.getBlockNumber({
            number: FMT_NUMBER.STR,
            bytes: FMT_BYTES.HEX
        })).toNumber();

        await this.web3
            .governorInterface
            .proposalState(
                web3Config, this.proposal.companyAddress, this.proposal.proposalId, web3Batch,
                result => {
                    this._state = result
                });
        await this.web3
            .governorInterface
            .proposalVoteStartBlock(
                web3Config, this.proposal.companyAddress, this.proposal.proposalId, web3Batch,
                result => {
                    this._votingStartBlock = Number(result);
                    this._votingStartBlockDiff = Math.abs(this._votingStartBlock - currentBlock);
                });

        await this.loadAdditionalData(useCaching, web3Batch);

        await this.web3
            .governorInterface
            .proposalVoteEndBlock(
                web3Config, this.proposal.companyAddress, this.proposal.proposalId, web3Batch,
                result => {
                    this._votingEndBlock = Number(result);
                    this._votingEndBlockDiff = this._state == 1 || this._votingEndBlock < currentBlock
                        ? Math.abs(this._votingEndBlock - currentBlock)
                        : 1;
                    this.loadedEvent.emit();
                });
    }

    protected abstract loadAdditionalData(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void>;
}

export class GovernanceProposalSignatureType {
    public requiredPercent = 0;
    public currentPercent = 0;
    public type = '';
}
