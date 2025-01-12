import {LiquidityMiningDataForList, LiquidityMiningListData} from "../data/liquidity-mining-list.data";
import {GlobalsService} from "../../../../shared/service/globals.service";
import {loadDeploymentsList} from "../../../../shared/loader/deployments-list.base-loader";
import type DeploymentBase
  from "@unleashed-business/opendapps-cloud-ts-commons/dist/web2/data/deployment/base/deployment.base";

export async function loadLiquidityMiningListData(globals: GlobalsService): Promise<LiquidityMiningListData> {
  const config = globals.connection.blockchain;

  return loadDeploymentsList<LiquidityMiningDataForList, LiquidityMiningListData, DeploymentBase & {
    token: string
  }>(globals, "LiquidityMining", LiquidityMiningListData, LiquidityMiningDataForList, async (item, deployment, globals1, batch1) => {
    item.tokenAddress = deployment.token;
    await globals1.web3Services.tokenAsAService.views.name<string>(config, deployment.token, {}, batch1, response => item.tokenName = response);
  });
}
