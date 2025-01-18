import {
  BlockchainDefinition,
  DefaultEVMNativeTokenDecimals,
  type NumericResult,
} from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import { DeployLiquidityMiningData } from './deploy-liquidity-mining.data.js';
import { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import { BatchExecutor } from '../../../utils/batch.executor.js';
import type { ODAInfraContractRouterBuilderInterface } from '../../../commons/oda-infra-contract-router.interface.js';
import { bn_wrap } from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import Web3 from 'web3';

export async function loadLiquidityMiningDeployData(
  config: BlockchainDefinition,
  contractInfraRouter: ODAInfraContractRouterBuilderInterface,
  services: LoaderServiceProviderInterface,
  targetWallet: string,
): Promise<DeployLiquidityMiningData> {
  const data = new DeployLiquidityMiningData();

  await BatchExecutor.new(config, services.connection)
    .add(batch => loadDeployLiquidityMiningDataForObject(config,
      services,
      contractInfraRouter,
      data,
      batch,
      targetWallet))
    .execute();

  return data;
}

export async function loadDeployLiquidityMiningDataForObject(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  contractInfraRouter: ODAInfraContractRouterBuilderInterface,
  data: DeployLiquidityMiningData,
  batch: BatchRequest,
  targetWallet: string,
): Promise<void> {
  const router = contractInfraRouter.build(config);
  const tokenAsAServiceDeployer = await router.tokenAsAServiceDeployer;
  const contractDeployer = await router.contractDeployer;
  const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, targetWallet);
  const owners = [targetWallet, ...organizations];
  const ownedObjects = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, 'TokenAsAService');
  const tokens = Object.values(ownedObjects).flat();
  const percentScaling = await services.web3Services.tokenAsAServiceDeployer.views.PERCENT_SCALING<NumericResult>(config, tokenAsAServiceDeployer, {})
    .then(x => bn_wrap(x as NumericResult).toNumber());

  for (let token of tokens) {
    const temp: any = { address: token };
    await services.web3Services.token.views.name(config, token, {}, batch, (value) => {
      temp.name = value;
    });
    await services.web3Services.tokenAsAService.views.owner(config, token, {}, batch, value => {
      temp.owner = value;
      data.ownedPlatformTokens.push(temp);
    });
  }

  await services.web3Services.tokenAsAServiceDeployer.views.liquidityMiningServiceTax<NumericResult>(config, tokenAsAServiceDeployer, {}, batch, response => {
    data.serviceTax = bn_wrap(response).dividedBy(percentScaling);
  });

  await services.web3Services.contractDeployer.views
    .deployTaxForAddress<NumericResult>(
      config,
      contractDeployer,
      { deployer: targetWallet, groupHash: Web3.utils.keccak256('LIQUIDITY_MINING'), typeNumber: 0 },
      batch,
      x => data.deployTax = bn_wrap(x).dividedBy(DefaultEVMNativeTokenDecimals),
    );
}
