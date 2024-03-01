import DeploymentBase from "./data/deployment/base/deployment.base.js";
import {BaseHttpService} from "./base/base-http.service.js";

export class DeploymentHttpService extends BaseHttpService {
    private static readonly ADDR_PREFIX = '/backend/deployment';
    public static readonly FETCH = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}/{target}`;
    public static readonly LIST = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}/list`;
    public static readonly FETCH_MULTI = `${DeploymentHttpService.ADDR_PREFIX}/{chainId}`;

    public async fetch<T extends DeploymentBase>(chainId: number, targetAddress: string): Promise<T> {
        const relativePath = DeploymentHttpService.FETCH
            .replace("{chainId}", chainId.toString())
            .replace("{target}", targetAddress);

        return this.GET(relativePath);
    }

    public async fetchMulti<T extends DeploymentBase>(chainId: number, targetAddresses: string[]): Promise<Record<string, T>> {
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

    public async list<T extends DeploymentBase>(chainId: number, type: string, take?: number, skip?: number): Promise<T[]> {
        let relativePath = DeploymentHttpService.LIST
            .replace("{chainId}", chainId.toString());

        relativePath += `?type=${type}`;
        if (take !== undefined) {
            relativePath += `&take=${take}`;
        }
        if (skip !== undefined) {
            relativePath += `&skip=${skip}`;
        }

        return this.GET(relativePath);
    }
}
