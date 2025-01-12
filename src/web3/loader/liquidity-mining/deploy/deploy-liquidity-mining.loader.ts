import type { BlockchainDefinition } from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import type { DeployLiquidityMiningData } from './deploy-liquidity-mining.data.js';
import type { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export async function loadLiquidityMiningDeployData(globals: GlobalsService): Promise<DeployLiquidityMiningData> {
  const data = new DeployLiquidityMiningData();

  await Web3BatchRunnable(globals, async (batch) => {
    await loadDeployLiquidityMiningDataForObject(globals, data, batch);
  });

  return data;
}

export async function loadDeployLiquidityMiningDataForObject(config: BlockchainDefinition, services: LoaderServiceProviderInterface, data: DeployLiquidityMiningData, batch: BatchRequest): Promise<void> {
  const ownedObjects = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, 'TokenAsAService');
  const tokens = [...ownedObjects.tokens, ...ownedObjects.entities.flatMap((x) => x.tokens)].map((x) => x.address);

  const percentScaling = await globals.web3Services.tokenAsAServiceDeployer.views.PERCENT_SCALING<NumericResult>(
    config, await globals.blockchainRouterService.tokenAsAServiceDeployer, {},
  ).then(x => bn_wrap(x as NumericResult).toNumber());

  for (let token of tokens) {
    const temp: any = { address: token };
    await globals.web3Services.token.views.name(config, token, {}, batch, (value) => {
      temp.name = value;
    });
    await globals.web3Services.tokenAsAService.views.owner(config, token, {}, batch, value => {
      temp.owner = value;
      data.ownedPlatformTokens.push(temp);
    });
  }

  await globals.web3Services.tokenAsAServiceDeployer.views.liquidityMiningServiceTax<NumericResult>(
    config,
    await globals.blockchainRouterService.tokenAsAServiceDeployer,
    {}, batch, response => {
      data.serviceTax = bn_wrap(response).dividedBy(percentScaling);
    });

  await globals.web3Services.contractDeployer.views
    .deployTaxForAddress<NumericResult>(
      globals.connection.blockchain,
      await globals.blockchainRouterService.contractDeployer,
      { deployer: globals.connection.accounts[0], groupHash: Web3.utils.keccak256('LIQUIDITY_MINING'), typeNumber: 0 },
      batch,
      x => data.deployTax = bn_wrap(x).dividedBy(DefaultEVMNativeTokenDecimals),
    );
}
