import {ProposalWithStateData} from '../../../../web2/data/multi-sign-proposal/proposal-with-state.data.js';
import {HttpServicesContainer} from '../../../../http-services.container.js';
import {Web3ServicesContainer} from '../../../../web3-services.container.js';
import {FMT_BYTES, FMT_NUMBER} from 'web3-types';
import {
    BlockchainDefinition,
    type NumericResult,
    type ReadOnlyWeb3Connection
} from '@unleashed-business/ts-web3-commons';
import {type Web3DataInterface} from '../../base/web3-data.interface.js';
import {bigNumberPipe} from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js';
import {BigNumber} from "bignumber.js";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";
import {BatchRequest} from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export abstract class GovernanceProposalData implements Web3DataInterface {
    private _state: number = 0;
    private _votingStartBlock: BigNumber = new BigNumber(0);
    private _votingStartBlockDiff: BigNumber = new BigNumber(0);
    private _votingEndBlock: BigNumber = new BigNumber(0);
    private _votingEndBlockDiff: BigNumber = new BigNumber(0);

    public get state(): number {
        return this._state;
    }

    public get votingStartBlock(): BigNumber {
        return this._votingStartBlock;
    }

    public get votingStartBlockDiff(): BigNumber {
        return this._votingStartBlockDiff;
    }

    public get votingEndBlock(): BigNumber {
        return this._votingEndBlock;
    }

    public get votingEndBlockDiff(): BigNumber {
        return this._votingEndBlockDiff;
    }

    public abstract get voteSignatures(): GovernanceProposalSignatureType[];

    public abstract get newMembersList(): string[];

    protected constructor(
        public readonly proposal: ProposalWithStateData,
        protected readonly connection: ReadOnlyWeb3Connection,
        protected readonly web3: Web3ServicesContainer,
        protected readonly web2: HttpServicesContainer,
    ) {
    }

    async load(
        useCaching: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
        timeout?: number,
        currentBlockExternal?: BigNumber
    ): Promise<void> {
        const currentBlock = currentBlockExternal !== undefined
            ? currentBlockExternal
            : await this.connection.getWeb3ReadOnly(config).eth.getBlockNumber({
                number: FMT_NUMBER.STR,
                bytes: FMT_BYTES.HEX,
            }).then(bigNumberPipe);

        const web3Connection = this.connection.getWeb3ReadOnly(config);
        const batch = web3Batch ?? new BatchRequest(web3Connection);
        const governorContract = this.web3.governorInterface.readOnlyInstance(config, this.proposal.entityAddress);

        await governorContract
            .proposalState<NumericResult>({proposalId: this.proposal.proposalId}, batch, (result) => {
                this._state = bn_wrap(result).toNumber();
            });

        await governorContract
            .proposalVoteStartBlock<NumericResult>({proposalId: this.proposal.proposalId}, batch, (result) => {
                this._votingStartBlock = bn_wrap(result);
                this._votingStartBlockDiff = this._votingStartBlock.minus(currentBlock).abs();
            });

        await governorContract
            .proposalVoteEndBlock<NumericResult>({proposalId: this.proposal.proposalId}, batch, (result) => {
                this._votingEndBlock = bn_wrap(result);
                this._votingEndBlockDiff = this._state == 1 || this._votingEndBlock.lt(currentBlock)
                    ? this._votingEndBlock.minus(currentBlock).abs()
                    : bn_wrap(1);
            });

        await this.loadAdditionalData(useCaching, config, batch);

        if (web3Batch === undefined) {
            await batch.execute({timeout: timeout ?? 10_000});
        }
    }

    protected abstract loadAdditionalData(
        useCaching: boolean,
        config: BlockchainDefinition,
        web3Batch?: BatchRequest,
    ): Promise<void>;
}

export class GovernanceProposalSignatureType {
    public requiredPercent = 0;
    public currentPercent = 0;
    public type = '';
}
