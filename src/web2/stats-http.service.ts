import { BaseHttpService } from './base/base-http.service.js';
import type {StakingStatsDto} from "./data/stats/staking-stats.dto.js";
import type {TokenStatsDto} from "./data/stats/token-stats.dto.js";
import type {TokenPairStatsDto} from "./data/stats/token-pair-stats.dto.js";

export class StatsHttpService extends BaseHttpService {
  public static readonly STAKING_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/staking/{targetChain}/{address}';
  public static readonly TOKEN_LATEST_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/token/{targetChain}/{address}/latest';
  public static readonly TOKEN_LIST_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/token/{targetChain}/{address}';
  public static readonly TOKEN_LIST_STATS_FOR_CHAIN_AND_ADDRESS_PERIOD = '/stats/token/{targetChain}/{address}/series';
  public static readonly DEX_PAIR_LATEST_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/dex/{targetChain}/{address}/latest';
  public static readonly DEX_PAIR_LIST_STATS_FOR_CHAIN_AND_ADDRESS = '/stats/dex/{targetChain}/{address}';
  public static readonly DEX_PAIR_LIST_STATS_FOR_CHAIN_AND_ADDRESS_PERIOD = '/stats/dex/{targetChain}/{address}/series';

  public async getStakingStats(chainId: number, address: string): Promise<StakingStatsDto> {
    const relativeUrl = StatsHttpService.STAKING_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());

    return this.GET(relativeUrl);
  }

  public async getLatestTokenStats(chainId: number, address: string): Promise<TokenStatsDto> {
    const relativeUrl = StatsHttpService.TOKEN_LATEST_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());

    return this.GET(relativeUrl);
  }

  public async getLatestDexPairStats(chainId: number, address: string): Promise<TokenPairStatsDto> {
    const relativeUrl = StatsHttpService.DEX_PAIR_LATEST_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());

    return this.GET(relativeUrl);
  }

  public async listTokenStats(chainId: number, address: string, take: number = 10, skip: number = 0): Promise<TokenStatsDto[]> {
    let relativeUrl = StatsHttpService.TOKEN_LIST_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());
    relativeUrl += `?take=${take}&skip=${skip}`;

    return this.GET(relativeUrl);
  }

  public async listDexPairStats(chainId: number, address: string, take: number = 10, skip: number = 0): Promise<TokenPairStatsDto[]> {
    let relativeUrl = StatsHttpService.DEX_PAIR_LIST_STATS_FOR_CHAIN_AND_ADDRESS
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());
    relativeUrl += `?take=${take}&skip=${skip}`;

    return this.GET(relativeUrl);
  }


  public async listTokenStatsForPeriod(chainId: number, address: string, from: number, to: number): Promise<TokenStatsDto[]> {
    let relativeUrl = StatsHttpService.TOKEN_LIST_STATS_FOR_CHAIN_AND_ADDRESS_PERIOD
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());
    relativeUrl += `?from=${from}&to=${to}`;

    return this.GET(relativeUrl);
  }

  public async listDexPairStatsForPeriod(chainId: number, address: string, from: number, to: number): Promise<TokenPairStatsDto[]> {
    let relativeUrl = StatsHttpService.DEX_PAIR_LIST_STATS_FOR_CHAIN_AND_ADDRESS_PERIOD
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, address.toString());
    relativeUrl += `?from=${from}&to=${to}`;

    return this.GET(relativeUrl);
  }

}
