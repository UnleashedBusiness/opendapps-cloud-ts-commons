import { BaseHttpService } from './base/base-http.service.js';

export class OwnershipHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/ownership';
  public static readonly OWNER_OF = `${OwnershipHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;
  public static readonly OWNER_OF_MULTI = `${OwnershipHttpService.ADDR_PREFIX}/{chainId}/ownerOf`;

  public async ownerOf(chainId: number, wallet: string, type: string): Promise<string[]> {
    let relativePath = OwnershipHttpService.OWNER_OF
        .replace("{chainId}", chainId.toString())
        .replace("{wallet}", wallet);
    relativePath += '?type=' + encodeURIComponent(type);
    return this.GET(relativePath)
  }

  public async ownerOfMulti(chainId: number, wallets: string[], type: string): Promise<Record<string, string[]>> {
    let relativePath = OwnershipHttpService.OWNER_OF_MULTI
        .replace("{chainId}", chainId.toString());
    relativePath += '?type=' + encodeURIComponent(type);
    if (wallets.length > 0) {
      for (const wallet of wallets) {
        relativePath += '&address=' + encodeURIComponent(wallet);
      }
    }
    return this.GET(relativePath)
  }
}
