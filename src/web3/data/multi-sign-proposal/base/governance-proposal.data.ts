import { ProposalWithStateData } from '../../../../web2/data/multi-sign-proposal/proposal-with-state.data';
import { HttpServicesContainer } from '../../../../http-services.container';
import { Web3ServicesContainer } from '../../../../web3-services.container';
import { Web3BatchRequest } from 'web3-core';
import BigNumber from 'bignumber.js';
import { FMT_BYTES, FMT_NUMBER } from 'web3-types';
import { BlockchainDefinition, ReadOnlyWeb3Connection } from '@unleashed-business/ts-web3-commons';
import { Web3DataInterface } from '../../base/web3-data.interface';
import { bigNumberPipe } from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils';

export abstract class GovernanceProposalData implements Web3DataInterface {
  private _state: number = 0;
  private _votingStartBlock: number = 0;
  private _votingStartBlockDiff: number = 0;
  private _votingEndBlock: number = 0;
  private _votingEndBlockDiff: number = 0;

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

  public abstract get newMembersList(): string[];

  protected constructor(
    public readonly proposal: ProposalWithStateData,
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
    const currentBlock = new BigNumber(
      await this.connection.getWeb3ReadOnly(config).eth.getBlockNumber({
        number: FMT_NUMBER.STR,
        bytes: FMT_BYTES.HEX,
      }),
    ).toNumber(); //TODO: fix, slows down listing

    const batch = web3Batch ?? new (this.connection.getWeb3ReadOnly(config).BatchRequest)();
    const governorContract = this.web3.governorInterface.readOnlyInstance(config, this.proposal.entityAddress);

    governorContract
      .proposalState({ proposalId: this.proposal.proposalId }, batch)
      .then(bigNumberPipe)
      .then((result) => {
        this._state = result.toNumber();
      });

    governorContract
      .proposalVoteStartBlock({ proposalId: this.proposal.proposalId }, batch)
      .then(bigNumberPipe)
      .then((result) => {
        this._votingStartBlock = Number(result);
        this._votingStartBlockDiff = Math.abs(this._votingStartBlock - currentBlock);
      });

    governorContract
      .proposalVoteEndBlock({ proposalId: this.proposal.proposalId }, batch)
      .then(bigNumberPipe)
      .then((result) => {
        this._votingEndBlock = Number(result);
        this._votingEndBlockDiff =
          this._state == 1 || this._votingEndBlock < currentBlock ? Math.abs(this._votingEndBlock - currentBlock) : 1;
      });

    await this.loadAdditionalData(useCaching, config, batch);

    if (web3Batch === undefined) {
      await batch.execute({ timeout });
    }
  }

  protected abstract loadAdditionalData(
    useCaching: boolean,
    config: BlockchainDefinition,
    web3Batch?: Web3BatchRequest,
  ): Promise<void>;
}

export class GovernanceProposalSignatureType {
  public requiredPercent = 0;
  public currentPercent = 0;
  public type = '';
}
