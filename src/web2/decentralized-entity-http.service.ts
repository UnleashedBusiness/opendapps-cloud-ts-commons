import {BaseHttpService} from "./base/base-http.service.js";
import type {NftMetadata} from "./data/base/nft/nft-metadata.js";

export class DecentralizedEntityHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/entity';
  public static readonly DEPLOY_OWNERSHIP_NFT = `${DecentralizedEntityHttpService.ADDR_PREFIX}/ownershipNFTMetadata`;
  public static readonly MEMBER_OF = `${DecentralizedEntityHttpService.ADDR_PREFIX}/{chainId}/memberOf/{wallet}`;
  public static readonly COMPANY_MEMBERS = `${DecentralizedEntityHttpService.ADDR_PREFIX}/{chainId}/members/{entity}`;

  public async memberOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = DecentralizedEntityHttpService.MEMBER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }

  public async members(chainId: number, entity: string): Promise<string[]> {
    const relativePath = DecentralizedEntityHttpService.COMPANY_MEMBERS
      .replace("{chainId}", chainId.toString())
      .replace("{entity}", entity);
    return this.GET(relativePath)
  }

  public async createOwnershipNFTMetadata(data: NftMetadata): Promise<{ url: string }> {
    return this.POST(DecentralizedEntityHttpService.DEPLOY_OWNERSHIP_NFT, data);
  }
}
