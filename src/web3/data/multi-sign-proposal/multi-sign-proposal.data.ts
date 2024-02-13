import { GovernanceProposalData, GovernanceProposalSignatureType } from './base/governance-proposal.data.js';
import { ProposalWithStateData } from '../../../web2/data/multi-sign-proposal/proposal-with-state.data.js';
import { Web3ServicesContainer } from '../../../web3-services.container.js';
import { HttpServicesContainer } from '../../../http-services.container.js';
import { Web3BatchRequest } from 'web3-core';
import {
  BlockchainDefinition,
  type NumericResult,
  type ReadOnlyWeb3Connection
} from '@unleashed-business/ts-web3-commons';
import { bigNumberPipe } from '@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js';

export class MultiSignProposalData extends GovernanceProposalData {
  private availableRootSignaturesCount = 0;
  private availableTotalSignaturesCount = 0;
  private requiredRootSignaturesCount = 0;
  private requiredTotalSignaturesCount = 0;
  private currentRootSignaturesCount = 0;
  private currentTotalSignaturesCount = 0;

  constructor(
    proposal: ProposalWithStateData,
    connection: ReadOnlyWeb3Connection,
    web3: Web3ServicesContainer,
    web2: HttpServicesContainer,
  ) {
    super(proposal, connection, web3, web2);
  }

  public override get voteSignatures(): GovernanceProposalSignatureType[] {
    return [
      {
        type: 'Root Signatures',
        requiredPercent:
          this.availableRootSignaturesCount > 0
            ? this.requiredRootSignaturesCount / this.availableRootSignaturesCount
            : 0,
        currentPercent:
          this.availableRootSignaturesCount > 0
            ? this.currentRootSignaturesCount / this.availableRootSignaturesCount
            : 0,
      },
      {
        type: 'Total Signatures (Root + Leaf)',
        requiredPercent:
          this.availableTotalSignaturesCount > 0
            ? this.requiredTotalSignaturesCount / this.availableTotalSignaturesCount
            : 0,
        currentPercent:
          this.availableTotalSignaturesCount > 0
            ? this.currentTotalSignaturesCount / this.availableTotalSignaturesCount
            : 0,
      },
    ];
  }

  public override get newMembersList(): string[] {
    return this.proposal.methodCallList
      .map((x) => {
        return {
          method: x.methodCallAbi.substring(0, x.methodCallAbi.indexOf('(')),
          args: x.methodCallAbi.substring(x.methodCallAbi.indexOf('(') + 1, x.methodCallAbi.indexOf(')')),
        };
      })
      .filter((x) => ['promoteRoot', 'promoteLeaf'].filter((y) => y == x.method).length > 0)
      .map((x) => x.args);
  }

  protected async loadAdditionalData(
    _: boolean,
    config: BlockchainDefinition,
    web3Batch?: Web3BatchRequest,
  ): Promise<void> {
    const entityContract = this.web3.multiSignEntity.readOnlyInstance(config, this.proposal.entityAddress);

    entityContract
      .requiredRootSignatures<NumericResult>({}, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.requiredRootSignaturesCount = result.toNumber();
      });
    entityContract
      .requiredTotalSignatures<NumericResult>({}, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.requiredTotalSignaturesCount = result.toNumber();
      });
    entityContract
      .availableRootSignatures<NumericResult>({}, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.availableRootSignaturesCount = result.toNumber();
      });
    entityContract
      .availableTotalSignatures<NumericResult>({}, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.availableTotalSignaturesCount = result.toNumber();
      });
    entityContract
      .currentRootSignatures<NumericResult>({ proposalId: this.proposal.proposalId }, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.currentRootSignaturesCount = result.toNumber();
      });
    entityContract
      .currentTotalSignatures<NumericResult>({ proposalId: this.proposal.proposalId }, web3Batch)
      .then(bigNumberPipe)
      .then((result) => {
        this.currentTotalSignaturesCount = result.toNumber();
      });
  }
}
