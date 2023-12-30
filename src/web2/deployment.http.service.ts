import DeploymentBase from "./data/deployment/base/deployment.base";
import {BaseHttpService} from "./base/base-http.service";

export class DeploymentHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/deployment';
  public static readonly FETCH = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}/{target}`;
  public static readonly FETCH_MULTI = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}`;

  public async fetch<T extends DeploymentBase>(chainId: number, targetAddress: string): Promise<T> {
    const relativePath = DeploymentHttpService.FETCH
      .replace("{chainId}", chainId.toString())
      .replace("{target}", targetAddress);

    return this.GET(relativePath);
  }

  public async fetchMulti<T extends DeploymentBase>(chainId: number, targetAddresses: string[]): Promise<T> {
    let relativePath = DeploymentHttpService.FETCH_MULTI
      .replace("{chainId}", chainId.toString());
    if (targetAddresses.length > 0) {
      relativePath += '?a=a';
      for (const wallet of targetAddresses) {
        relativePath += '&address=' + wallet;
      }
    }

    return this.GET(relativePath);
  }
}
