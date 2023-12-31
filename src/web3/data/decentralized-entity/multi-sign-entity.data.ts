import { BaseDecentralizedEntityData } from './base/base-decentralized-entity.data';
import Web3 from 'web3';
import { ProposalStateEnum } from '../../enum/proposal-state.enum';
import DecentralizedEntityDeployment from '../../../web2/data/deployment/decentralized-entity-deployment';
import { Web3ServicesContainer } from '../../../web3-services.container';
import { HttpServicesContainer } from '../../../http-services.container';
import { Web3BatchRequest } from 'web3-core';
import { BlockchainDefinition, ReadOnlyWeb3Connection } from '@unleashed-business/ts-web3-commons';

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
    useCaching: boolean,
    config: BlockchainDefinition,
    web3Batch?: Web3BatchRequest,
  ): Promise<void> {
    const entityContract = this.web3.multiSignEntity.readOnlyInstance(config, this.address);

    this._roots = [];
    this._leafs = [];
    for (let i = 0; i < this._teamMembers.length; i++) {
      entityContract
        .hasRole({ role: Web3.utils.sha3('MULTISIGN_PROTOCOL_ROOT'), account: this._teamMembers[i] }, web3Batch)
        .then((result) => {
          if (result) {
            this._roots.push(this._teamMembers[i]);
          }
        });

      entityContract
        .hasRole({ role: Web3.utils.sha3('MULTISIGN_PROTOCOL_LEAF'), account: this._teamMembers[i] }, web3Batch)
        .then((result) => {
          if (result) {
            this._leafs.push(this._teamMembers[i]);
          }
        });
    }

    this.web2.multiSignProposal
      .listForCompanyByState(config.networkId, this.address, ProposalStateEnum.Active.valueOf())
      .then((proposalsToVote) => {
        this._votingProposals = proposalsToVote.map((x) => x.proposalId);
      });
  }
}
