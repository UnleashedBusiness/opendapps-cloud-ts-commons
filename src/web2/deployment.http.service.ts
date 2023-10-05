import DeploymentBase from "./data/deployment/base/deployment.base";
import {BaseHttpService} from "./base/base-http.service";

export class DeploymentHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/deployment';
  public static readonly FETCH = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}/{target}`;

  public async fetch<T extends DeploymentBase>(chainId: number, targetAddress: string): Promise<T> {
    const relativePath = DeploymentHttpService.FETCH
      .replace("{chainId}", chainId.toString())
      .replace("{target}", targetAddress);

    return this.GET(relativePath);
  }
}
