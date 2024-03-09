import {BaseHttpService} from "./base/base-http.service.js";

export class TreasuryDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/treasury';
  public static readonly OWNER_OF = `${TreasuryDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;
  public static readonly OWNER_OF_MULTI = `${TreasuryDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf`;

  public async ownerOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = TreasuryDeployerHttpService.OWNER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }

  public async ownerOfMulti(chainId: number, wallets: string[]): Promise<Record<string, string[]>> {
    let relativePath = TreasuryDeployerHttpService.OWNER_OF_MULTI
      .replace("{chainId}", chainId.toString());
    if (wallets.length > 0) {
      relativePath += '?a=a';
      for (const wallet of wallets) {
        relativePath += '&address=' + wallet;
      }
    }
    return this.GET(relativePath)
  }
}
