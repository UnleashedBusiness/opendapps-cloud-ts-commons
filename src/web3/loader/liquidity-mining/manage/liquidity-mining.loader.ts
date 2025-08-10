import {
  LiquidityMiningData,
  LiquidityMiningDexData,
  LiquidityMiningPoolData,
  LiquidityMiningTokenData,
} from './liquidity-mining.data.js';
import {
  type BlockchainDefinition, ContractToolkitService, DefaultEVMNativeTokenDecimalSize,
  EmptyAddress,
  type NumericResult,
  Web3Contract,
} from '@unleashed-business/ts-web3-commons';
import {
  LiquidityMiningAbi,
  type LiquidityMiningAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi/dist/abi/liquidity-mining.abi.js';
import { bn_wrap } from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import { StakingRewardToken } from '../../staking/manage/staking-manage.data.js';
import type { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import type { ODAInfraContractRouterBuilderInterface } from '../../../commons/oda-infra-contract-router.interface.js';
import { loadDeployLiquidityMiningDataForObject } from '../deploy/deploy-liquidity-mining.loader.js';
import { BatchExecutor } from '../../../utils/batch.executor.js';
import { web3AddressEq, web3IsEmptyAddress } from '../../../commons/funcs.js';
import { BigNumber } from 'bignumber.js';

export async function loadLiquidityMiningData(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  contractInfraRouter: ODAInfraContractRouterBuilderInterface,
  toolkit: ContractToolkitService,
  forWallet: string,
  lmAddress?: string,
): Promise<LiquidityMiningData> {
  const router = contractInfraRouter.build(config);
  const data = new LiquidityMiningData();

  data.address = lmAddress === EmptyAddress ? undefined : lmAddress;
  data.predefinedPairingTokens = [
    { address: EmptyAddress, name: `Native Token (${config.networkSymbol})` },
  ];

  if (lmAddress === undefined || lmAddress === EmptyAddress) {
    await BatchExecutor.new(config, services.connection)
      .add(batch => loadDeployLiquidityMiningDataForObject(
          config,
          services,
          contractInfraRouter,
          data,
          batch,
          forWallet,
        ),
      ).execute();

    return data;
  }

  const lmContract = new Web3Contract<LiquidityMiningAbiFunctional>(toolkit, LiquidityMiningAbi);
  const availableRouters = (await services.web3Services.tokenAsAServiceDeployer.views.availableDexRouters(config, await router.tokenAsAServiceDeployer, {})) as string[];

  const temp: any = {};

  temp.pairs = {};
  const routerPairsExecutor = BatchExecutor.new(config, services.connection);

  for (let router of availableRouters) {
    routerPairsExecutor.add(batch => lmContract.views.allowedPairsForRouter<string[]>(config, lmAddress!, { router: router }, batch, response => temp.pairs[router] = response));
  }
  routerPairsExecutor.add(batch => lmContract.views.token<string>(config, lmAddress!, {}, batch, response => data.token.address = response));
  routerPairsExecutor.add(batch => lmContract.views.stakingCommonAddress<string>(config, data.address!, {}, batch, response => data.stakingCommonAddress = response, () => {
    data.stakingCommonAddress = EmptyAddress;
  }));

  await routerPairsExecutor.execute();

  temp.tokens = {};
  const tokensExecutor = BatchExecutor.new(config, services.connection);

  for (let router of availableRouters) {
    tokensExecutor.add(batch => services.web3Services.uniswapRouter.views.WETH<string>(config, router, {}, batch, response => temp.weth = response));
    for (let pair of temp.pairs[router]) {
      tokensExecutor.add(batch => services.web3Services.uniswapPair.views.token0<string>(config, pair, {}, batch, response => !web3AddressEq(response, data.token.address) ? temp.tokens[pair] = response : undefined));
      tokensExecutor.add(batch => services.web3Services.uniswapPair.views.token1<string>(config, pair, {}, batch, response => !web3AddressEq(response, data.token.address) ? temp.tokens[pair] = response : undefined));
    }
  }

  await tokensExecutor.execute();

  const dexPairsExecutor = BatchExecutor.new(config, services.connection);

  for (let router of availableRouters) {
    dexPairsExecutor.add(batch => services.web3Services.uniswapRouter.views.WETH<string>(config, router, {}, batch, response => temp.weth = response));
    for (let pair of temp.pairs[router]) {
      dexPairsExecutor.add(
        batch => services.web3Services.uniswapPair.views.token0<string>(config, pair, {}, batch, response => !web3AddressEq(response, data.token.address) ? temp.tokens[pair] = response : undefined),
        batch => services.web3Services.uniswapPair.views.token1<string>(config, pair, {}, batch, response => !web3AddressEq(response, data.token.address) ? temp.tokens[pair] = response : undefined),
      );
    }
  }
  dexPairsExecutor.add(
    batch => services.web3Services.tokenAsAService.views.tokenomics<string>(config, data.token.address, {}, batch, response => {
      data.tokenTokenomicsAddress = response ?? EmptyAddress;
    }, _ => {
      data.tokenTokenomicsAddress = EmptyAddress;
    }),
  );

  if (data.hasStaking) {
    dexPairsExecutor.add(
      batch => services.web3Services.stakingAsAService.views.rewardTokens<string[]>(config, data.stakingCommonAddress, {}, batch, response => temp.rewardTokens = response),
      batch => services.web3Services.stakingAsAService.views.epochBlockDistance<NumericResult>(config, data.stakingCommonAddress, {}, batch, response => data.stakingCommonBlocksPerPayout = bn_wrap(response).toNumber()),
      batch => lmContract.views.STAKING_MULTIPLIER_SCALING<NumericResult>(config, data.address!, {}, batch, response => data.stakingRewardsMultipliersScaling = bn_wrap(response).toNumber()),
    );
  }

  await dexPairsExecutor.execute();

  const mainExecutor = BatchExecutor.new(config, services.connection);

  mainExecutor.add(batch => loadTokenData(data.token, services, config, batch));
  if (data.hasStaking) {
    for (const key in Object.keys(temp.rewardTokens)) {
      const rewardsToken = new StakingRewardToken();

      rewardsToken.address = temp.rewardTokens[key];
      mainExecutor.add(
        batch => loadTokenData(rewardsToken, services, config, batch),
        batch => services.web3Services.stakingAsAService.views.totalAvailableRewards<NumericResult>(config, data.stakingCommonAddress, { token: rewardsToken.address }, batch, (result) => (rewardsToken.totalAvailableRewards = bn_wrap(result))),
        batch => services.web3Services.stakingAsAService.views.epochAvailableRewards<NumericResult>(config, data.stakingCommonAddress, { token: rewardsToken.address }, batch, (result) => (rewardsToken.rewardsForCurrentEpochIncrement = bn_wrap(result))),
        batch => services.web3Services.stakingAsAService.views.maxRewardsPerEpochForToken<NumericResult>(config, data.stakingCommonAddress, { token: rewardsToken.address }, batch, (result) => (rewardsToken.maxPerEpoch = bn_wrap(result))),
      );

      data.stakingCommonRewardsTokens.push(rewardsToken);
    }

    for (let predefinedToken of data.predefinedPairingTokens) {
      if (predefinedToken.address === EmptyAddress) continue;
      mainExecutor.add(batch => services.web3Services.token.views.name<string>(config, predefinedToken.address, {}, batch, response => predefinedToken.name = response));
    }

    mainExecutor.add(
      batch => lmContract.views.owner<string>(config, data.address!, {}, batch, response => data.owner = response),
      async batch => services.web3Services.contractDeployer.views
        .isUpgradeable<boolean>(config, await router.contractDeployer, { _contract: data.address! }, batch, (x) => (data.isUpgradeable = x)))
    ;
  }

  for (let router of availableRouters) {
    const dex = new LiquidityMiningDexData();
    dex.dexAddress = router;
    for (let pair of temp.pairs[router]) {
      const pool = new LiquidityMiningPoolData();

      pool.pairAddress = pair;
      pool.pairedToken.address = web3AddressEq(temp.tokens[pair], temp.weth) ? EmptyAddress : temp.tokens[pair];

      mainExecutor.add(
        batch => loadTokenData(pool.pairedToken, services, config, batch),
        batch => services.web3Services.uniswapPair.views.totalSupply<NumericResult>(config, pair, {}, batch, response => pool.pairTokenSupply = bn_wrap(response)),
        batch => services.web3Services.token.views.balanceOf<NumericResult>(config, data.token.address, { account: pair }, batch, response => pool.tokenAmount = bn_wrap(response)),
        batch => services.web3Services.token.views.balanceOf<NumericResult>(config, temp.tokens[pair], { account: pair }, batch, response => pool.pairedTokenAmount = bn_wrap(response)),
      );

      if (data.hasStaking) {
        mainExecutor.add(batch => {
          return lmContract.views.stakingRewardsMultiplier<NumericResult>(config, data.address!, { '0': pair }, batch, response => {
            const value = bn_wrap(response).toNumber();
            pool.stakinMultiplier = value > 0 ? value : data.stakingRewardsMultipliersScaling;
          });
        });
      }

      mainExecutor.add(batch => lmContract.views.balanceOf<NumericResult>(config, pair, {
        pair: pool.pairAddress,
        wallet: forWallet,
      }, batch, response => pool.connectedWalletPairBalance = bn_wrap(response)));

      if (!web3IsEmptyAddress(data.tokenTokenomicsAddress)) {
        mainExecutor.add(
          batch => services.web3Services.dymanicTokenomics.views
            .totalTaxForConfig<NumericResult>(config, data.tokenTokenomicsAddress, { i: 0 }, batch,
              (result) => {
                pool.tokenomicsEnabled = pool.tokenomicsEnabled && bn_wrap(result).toNumber() == 0;
              },
            ),
          batch => services.web3Services.dymanicTokenomics.views
            .totalTax<NumericResult>(config, data.tokenTokenomicsAddress, {
                from: EmptyAddress,
                to: pool.pairAddress,
              }, batch,
              (result) => {
                pool.tokenomicsEnabled = pool.tokenomicsEnabled || bn_wrap(result).toNumber() > 0;
              },
            ),
        );
      } else {
        pool.tokenomicsEnabled = true;
      }

      dex.pools.push(pool);
    }
    data.dexList.push(dex);
  }

  await mainExecutor.execute();

  return data;
}

async function loadTokenData(token: LiquidityMiningTokenData | StakingRewardToken, globals: LoaderServiceProviderInterface, config: BlockchainDefinition, batch: BatchRequest): Promise<void> {
  if (token.address !== EmptyAddress) {
    await globals.web3Services.token.views.name<string>(config, token.address, {}, batch, response => token.name = response);
    await globals.web3Services.token.views.symbol<string>(config, token.address, {}, batch, response => token.ticker = response);
    await globals.web3Services.token.views.decimals<NumericResult>(config, token.address, {}, batch, response => token.decimals = bn_wrap(response).toNumber());
    await globals.web3Services.token.views.totalSupply<NumericResult>(config, token.address, {}, batch, response => token.totalSupply = bn_wrap(response));
  } else {
    token.name = 'Native Token';
    token.ticker = config.networkSymbol;
    token.totalSupply = new BigNumber(-1);
    token.decimals = DefaultEVMNativeTokenDecimalSize;
  }
}
