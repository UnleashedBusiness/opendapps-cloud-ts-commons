import {BaseHttpService} from "./base/base-http.service.js";
import {NftMetadata} from "./data/base/nft/nft-metadata.js";

export class NftProxyHttpService extends BaseHttpService {
  public static readonly ORGANIZATION_METADATA_URL = '/nft-proxy/{targetChain}/entity/metadata/{address}';
  public static readonly ORGANIZATION_IMAGE_URL = '/nft-proxy/{targetChain}/entity/image/{address}';
  public static readonly TOKEN_METADATA_URL = '/nft-proxy/{targetChain}/token/metadata/{address}';
  public static readonly TOKEN_IMAGE_URL = '/nft-proxy/{targetChain}/token/image/{address}';
  public static readonly ERC721_METADATA_URL = '/nft-proxy/{targetChain}/erc721/metadata/{address}/{token}';
  public static readonly ERC721_IMAGE_URL = '/nft-proxy/{targetChain}/erc721/image/{address}/{token}';

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
}
