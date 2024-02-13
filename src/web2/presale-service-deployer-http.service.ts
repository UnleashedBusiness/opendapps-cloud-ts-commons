import {BaseHttpService} from "./base/base-http.service.js";

export class PresaleServiceDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/presale';
  public static readonly OWNER_OF = `${PresaleServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;
  public static readonly OWNER_OF_MULTI = `${PresaleServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf`;

  public async ownerOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = PresaleServiceDeployerHttpService.OWNER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }

  public async ownerOfMulti(chainId: number, wallets: string[]): Promise<Record<string, string[]>> {
    let relativePath = PresaleServiceDeployerHttpService.OWNER_OF_MULTI
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
