import {GovernanceProposalData, GovernanceProposalSignatureType} from "./base/governance-proposal.data";
import {ProposalWithStateData} from "../../../web2/data/multi-sign-proposal/proposal-with-state.data";
import { BlockchainDefinition, ReadOnlyWeb3Connection } from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import {Web3BatchRequest} from "web3-core";

export class MultiSignSharesProposalData extends GovernanceProposalData {
  private static companyOwnershipTokenCache: {
    [index: string]: { collection: string; token: number };
  } = {};

  private availableShares = 0;
  private requiredSharesSigned = 0;
  private currentSharesSigned = 0;

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
        type: "Shares Signed",
        requiredPercent:
          this.availableShares > 0
            ? this.requiredSharesSigned / this.availableShares
            : 0,
        currentPercent:
          this.availableShares > 0
            ? this.currentSharesSigned / this.availableShares
            : 0,
      },
    ];
  }

  public override get newMembersList(): string[] {
    return [];
  }

  protected async loadAdditionalData(
    useCaching: boolean,
    config: BlockchainDefinition,
    web3Batch?: Web3BatchRequest,
  ): Promise<void> {

    if (
      typeof MultiSignSharesProposalData.companyOwnershipTokenCache[
        this.proposal.companyAddress
      ] === "undefined"
    ) {
      MultiSignSharesProposalData.companyOwnershipTokenCache[
        this.proposal.companyAddress
      ] = {
        collection: (await this.web3.multiSignSharesEntity.ownershipCollection(
          config,
          this.proposal.companyAddress,
        )) as string,
        token: (await this.web3.multiSignSharesEntity.ownershipTokenId(
          config,
          this.proposal.companyAddress,
        )) as number,
      };
    }
    const ownershipAddress =
      MultiSignSharesProposalData.companyOwnershipTokenCache[
        this.proposal.companyAddress
      ].collection;
    const ownershipTokenId =
      MultiSignSharesProposalData.companyOwnershipTokenCache[
        this.proposal.companyAddress
      ].token;

    await this.web3.ownershipSharesNFTCollection.totalShares(
      config,
      ownershipAddress,
      ownershipTokenId,
      web3Batch,
      (result) => {
        this.availableShares = result;
      },
    );
    await this.web3.multiSignSharesEntity.requiredSignatures(
      config,
      this.proposal.companyAddress,
      this.proposal.proposalId,
      web3Batch,
      (result) => {
        this.requiredSharesSigned = result;
      },
    );
    await this.web3.multiSignSharesEntity.currentSharesSigned(
      config,
      this.proposal.companyAddress,
      this.proposal.proposalId,
      web3Batch,
      (result) => {
        this.currentSharesSigned = result;
      },
    );
    await this.web3.multiSignSharesEntity.currentSharesSigned(
      config,
      this.proposal.companyAddress,
      this.proposal.proposalId,
      web3Batch,
      (result) => {
        this.currentSharesSigned = result;
      },
    );
  }
}
