import {BaseHttpService} from "./base/base-http.service.js";
import type {NftMetadata} from "./data/base/nft/nft-metadata.js";

export class TokenAsAServiceDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/taas-deployer';
  public static readonly OWNER_OF = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;
  public static readonly OWNER_OF_MULTI = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf`;
  public static readonly DEPLOY_OWNERSHIP_NFT = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/ownershipNFTMetadata`;

  public async ownerOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = TokenAsAServiceDeployerHttpService.OWNER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }

  public async ownerOfMulti(chainId: number, wallets: string[]): Promise<Record<string, string[]>> {
    let relativePath = TokenAsAServiceDeployerHttpService.OWNER_OF_MULTI
      .replace("{chainId}", chainId.toString());
    if (wallets.length > 0) {
      relativePath += '?a=a';
      for (const wallet of wallets) {
        relativePath += '&address=' + wallet;
      }
    }
    return this.GET(relativePath)
  }

  public async createOwnershipNFTMetadata(data: NftMetadata): Promise<{ url: string }> {
    return this.POST(TokenAsAServiceDeployerHttpService.DEPLOY_OWNERSHIP_NFT, data);
  }
}
