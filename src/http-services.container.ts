import {DecentralizedEntityHttpService} from './web2/decentralized-entity-http.service.js';
import {TokenAsAServiceDeployerHttpService} from './web2/token-as-a-service-deployer-http.service.js';
import {NftProxyHttpService} from './web2/nft-proxy-http.service.js';
import {MultiSignProposalHttpService} from './web2/multi-sign-proposal-http.service.js';
import {IndexingHttpService} from './web2/indexing-http.service.js';
import {DeploymentHttpService} from './web2/deployment.http.service.js';
import {PresaleServiceDeployerHttpService} from './web2/presale-service-deployer-http.service.js';
import {BlocktimeHttpService} from "./web2/blocktime-http.service.js";
import {StakingAsAServiceDeployerHttpService} from "./web2/staking-as-a-service-deployer-http.service.js";
import {StatsHttpService} from "./web2/stats-http.service.js";
import type {TreasuryDeployerHttpService} from "./web2/treasury-deployer-http.service.js";

export class HttpServicesContainer {
    constructor(
        public readonly decentralizedEntity: DecentralizedEntityHttpService,
        public readonly tokenAsAService: TokenAsAServiceDeployerHttpService,
        public readonly nftProxy: NftProxyHttpService,
        public readonly multiSignProposal: MultiSignProposalHttpService,
        public readonly indexing: IndexingHttpService,
        public readonly deployment: DeploymentHttpService,
        public readonly presale: PresaleServiceDeployerHttpService,
        public readonly blocktime: BlocktimeHttpService,
        public readonly stakingAsAService: StakingAsAServiceDeployerHttpService,
        public readonly stats: StatsHttpService,
        public readonly treasury: TreasuryDeployerHttpService,
    ) {
    }
}
