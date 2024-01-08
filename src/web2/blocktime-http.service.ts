import { BaseHttpService } from './base/base-http.service';
import { NftMetadata } from './data/base/nft/nft-metadata';
import { BlocktimeForChain } from "./data/blocktime/blocktime-for-chain";

export class BlocktimeHttpService extends BaseHttpService {
  public static readonly BLOCKTIME_FOR_CHAIN = '/blocktime/indexing/{targetChain}';

  public async getChainBlocktime(chainId: number): Promise<BlocktimeForChain> {
    return this.GET(BlocktimeHttpService.BLOCKTIME_FOR_CHAIN.replace(/\{targetChain}/, chainId.toString()));
  }

}
