import {BaseHttpService} from "./base/base-http.service";

export class PresaleServiceDeployerHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/presale';
  public static readonly OWNER_OF = `${PresaleServiceDeployerHttpService.ADDR_PREFIX}/{chainId}/ownerOf/{wallet}`;

  public async ownerOf(chainId: number, wallet: string): Promise<string[]> {
    const relativePath = PresaleServiceDeployerHttpService.OWNER_OF
      .replace("{chainId}", chainId.toString())
      .replace("{wallet}", wallet);
    return this.GET(relativePath)
  }
}
