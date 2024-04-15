import {BaseHttpService} from "./base/base-http.service.js";
import type {NftMetadata} from "./data/base/nft/nft-metadata.js";

export class TokenAsAServiceDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/taas-deployer';
  public static readonly DEPLOY_OWNERSHIP_NFT = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/ownershipNFTMetadata`;

  public async createOwnershipNFTMetadata(data: NftMetadata): Promise<{ url: string }> {
    return this.POST(TokenAsAServiceDeployerHttpService.DEPLOY_OWNERSHIP_NFT, data);
  }
}
