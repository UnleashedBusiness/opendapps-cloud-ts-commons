import { BaseHttpService } from './base/base-http.service.js';
import { BlocktimeForChain } from "./data/blocktime/blocktime-for-chain.js";

export class BlocktimeHttpService extends BaseHttpService {
  public static readonly BLOCKTIME_FOR_CHAIN = '/blocktime/indexing/{targetChain}';

  public async getChainBlocktime(chainId: number): Promise<BlocktimeForChain> {
    return this.GET(BlocktimeHttpService.BLOCKTIME_FOR_CHAIN.replace(/\{targetChain}/, chainId.toString()));
  }

}
