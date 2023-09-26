import {HttpServiceConfig} from "./config/http-service.config";
import {BaseHttpService} from "./base/base-http.service";
import {OwnershipNftMetadataDeployData} from "./data/decentralized-entity/ownership-nft-metadata-deploy.data";

export class TokenAsAServiceDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/taas-deployer';
  public static readonly OWNER_OF = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;
  public static readonly DEPLOY_OWNERSHIP_NFT = `${TokenAsAServiceDeployerHttpService.ADDR_PREFIX}/ownershipNFTMetadata`;

  public async ownerOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = TokenAsAServiceDeployerHttpService.OWNER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }

  public async createOwnershipNFTMetadata(data: OwnershipNftMetadataDeployData): Promise<{ url: string }> {
    return this.POST(TokenAsAServiceDeployerHttpService.DEPLOY_OWNERSHIP_NFT, data);
  }
}
