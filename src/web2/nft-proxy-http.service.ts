import {HttpServiceConfig} from "./config/http-service.config";
import {BaseHttpService} from "./base/base-http.service";
import {NftMetadata} from "./data/base/nft/nft-metadata";

export class NftProxyHttpService extends BaseHttpService {
  public static readonly ORGANIZATION_METADATA_URL = '/proxy/{targetChain}/organization/metadata/{address}';
  public static readonly ORGANIZATION_IMAGE_URL = '/proxy/{targetChain}/organization/image/{address}';
  public static readonly TOKEN_METADATA_URL = '/proxy/{targetChain}/token/metadata/{address}';
  public static readonly TOKEN_IMAGE_URL = '/proxy/{targetChain}/token/image/{address}';
  public static readonly ERC721_METADATA_URL = '/proxy/{targetChain}/erc721/metadata/{address}/{token}';
  public static readonly ERC721_IMAGE_URL = '/proxy/{targetChain}/erc721/image/{address}/{token}';

  public async getErc721Metadata(chainId: number, collection: string, tokenId: number): Promise<NftMetadata> {
    return this.GET(
      NftProxyHttpService.ERC721_METADATA_URL
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, collection)
        .replace(/\{token}/, tokenId.toString())
    )
  }

  public async getErc721ImageUrl(chainId: number, collection: string, tokenId: number): Promise<string> {
    return this.getAbsoluteUrl(NftProxyHttpService.ERC721_IMAGE_URL
      .replace(/\{targetChain}/, chainId.toString())
      .replace(/\{address}/, collection)
      .replace(/\{token}/, tokenId.toString()));
  }

  public async getOrganizationMetadata(chainId: number, organization: string): Promise<NftMetadata> {
    return this.GET(
      NftProxyHttpService.ORGANIZATION_METADATA_URL
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, organization)
    );
  }

  public async getOrganizationImageUrl(chainId: number, organization: string): Promise<string> {
    return this.getAbsoluteUrl(
      NftProxyHttpService.ORGANIZATION_IMAGE_URL
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, organization)
    );
  }

  public async getTokenMetadata(chainId: number, token: string): Promise<NftMetadata> {
    return this.GET(
      NftProxyHttpService.TOKEN_METADATA_URL
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, token)
    );
  }

  public async getTokenImageUrl(chainId: number, token: string): Promise<string> {
    return this.getAbsoluteUrl(
      NftProxyHttpService.TOKEN_IMAGE_URL
        .replace(/\{targetChain}/, chainId.toString())
        .replace(/\{address}/, token)
    );
  }

  protected getAbsoluteUrl(relativeUrl: string): string {
    return this.config.nftProxyUrl[this.config.nftProxyUrl.length - 1] === '/'
        ? this.config.nftProxyUrl.substring(0, this.config.nftProxyUrl.length - 1)
        : this.config.nftProxyUrl
        + "/" +
        relativeUrl[0] === '/'
            ? relativeUrl.substring(1)
            : relativeUrl;
  }
}
