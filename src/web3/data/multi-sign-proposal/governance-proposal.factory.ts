import {OrganizationTypeEnum} from "../../enum/organization-type.enum";
import {GovernanceProposalData} from "./base/governance-proposal.data";
import {ProposalWithStateData} from "../../../web2/data/multi-sign-proposal/proposal-with-state.data";
import {MultiSignProposalData} from "./multi-sign-proposal.data";
import {MultiSignSharesProposalData} from "./multi-sign-shares-proposal.data";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import DecentralizedEntityDeployment from "../../../web2/data/deployment/decentralized-entity-deployment";
import { BlockchainDefinition, ReadOnlyWeb3Connection } from "@unleashed-business/ts-web3-commons";

export class GovernanceProposalFactory {
    private static decentralizedEntityTypeCache: { [index: string]: number } = {}

    static async buildIt(
        proposal: ProposalWithStateData,
        connection: ReadOnlyWeb3Connection,
        config: BlockchainDefinition,
        web3: Web3ServicesContainer,
        web2: HttpServicesContainer,
        useCache: boolean = false,
        autoLoad: boolean = true
    ): Promise<GovernanceProposalData> {
        if (typeof GovernanceProposalFactory.decentralizedEntityTypeCache[proposal.entityAddress] === "undefined") {
            const deployment = await web2
                .deployment
                .fetch<DecentralizedEntityDeployment>(config.networkId, proposal.entityAddress);

            GovernanceProposalFactory.decentralizedEntityTypeCache[proposal.entityAddress] = parseInt(deployment.type);
        }
        const type = GovernanceProposalFactory.decentralizedEntityTypeCache[proposal.entityAddress];

        let governanceProposal: GovernanceProposalData;
        switch (Number(type)) {
            case OrganizationTypeEnum.HierarchicalMultiSign.valueOf():
                governanceProposal = new MultiSignProposalData(proposal, connection, web3, web2);
                break;
            default:
                governanceProposal = new MultiSignSharesProposalData(proposal, connection, web3, web2);
                break;
        }
        if (autoLoad)
            await governanceProposal.load(useCache, config);
        return governanceProposal;
    }
}
