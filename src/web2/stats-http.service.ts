import { BaseHttpService } from './base/base-http.service.js';
import type {StakingStatsDto} from "./data/stats/staking-stats.dto.js";

export class StatsHttpService extends BaseHttpService {
  public static readonly STAKING_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/staking/{targetChain}/{address}';

  public async getStakingStats(chainId: number, address: string): Promise<StakingStatsDto> {
    const relativeUrl = StatsHttpService.STAKING_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());

    return this.GET(relativeUrl);
  }

}
