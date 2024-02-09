import { DecentralizedEntityHttpService } from './web2/decentralized-entity-http.service';
import { TokenAsAServiceDeployerHttpService } from './web2/token-as-a-service-deployer-http.service';
import { NftProxyHttpService } from './web2/nft-proxy-http.service';
import { MultiSignProposalHttpService } from './web2/multi-sign-proposal-http.service';
import { IndexingHttpService } from './web2/indexing-http.service';
import { DeploymentHttpService } from './web2/deployment.http.service';
import { PresaleServiceDeployerHttpService } from './web2/presale-service-deployer-http.service';
import { BlocktimeHttpService } from "./web2/blocktime-http.service";
import {StakingAsAServiceDeployerHttpService} from "./web2/staking-as-a-service-deployer-http.service";

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
  ) {}
}
