import {
  type BlockchainDefinition,
  DefaultEVMNativeTokenDecimalSize,
  EmptyAddress,
  type NumericResult,
} from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import { VestingData, VestingPayee, VestingPayeeToken, VestingToken } from './vesting.data.js';
import type { ODAInfraContractRouterBuilderInterface } from '../../../commons/oda-infra-contract-router.interface.js';
import { bn_wrap } from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import { BatchExecutor } from '../../../utils/batch.executor.js';

export async function loadVestingData(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  contractInfraRouter: ODAInfraContractRouterBuilderInterface,
  contractId: string,
  forWallet: string,
): Promise<VestingData> {
  const data = new VestingData();
  const prep: any = {};
  const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
  const owners = [forWallet, ...organizations];
  const tokensList = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, 'TokenAsAService');
  const ownedTokens = Object.values(tokensList).flat();
  const router = contractInfraRouter.build(config);
  const contractDeployer = await router.contractDeployer;

  data.address = contractId;
  data.ownedPlatformTokens.push({
    name: 'Native Token - ' + config.networkSymbol,
    address: EmptyAddress,
    owner: EmptyAddress,
  });

  const vestingService = services.web3Services.vestingService.readOnlyInstance(config, contractId);
  const contractDeployerService = services.web3Services.contractDeployer.readOnlyInstance(config, contractDeployer);

  await BatchExecutor.new(config, services.connection)
    .add(
      batch => vestingService.payees<any[][]>({}, batch, response => {
        prep.payees = response[0];
        prep.payeesPercent = response[1].map(x => bn_wrap(x).toNumber());
      }),
      batch => vestingService.controllers<any[][]>({}, batch, response => {
        prep.controllers = response[0];
        prep.controllersPercent = response[1].map(x => bn_wrap(x).toNumber());
      }),
      batch => vestingService.rewardTokens<string[]>({}, batch, response => prep.tokens = response),
    ).execute();

  const executor = BatchExecutor.new(config, services.connection)
    .add(batch => contractDeployerService.isUpgradeable<boolean>(
      { _contract: data.address },
      batch, (x) => (data.isUpgradeable = x),
    ));

  for (let token of ownedTokens) {
    const temp: any = { address: token };
    const tokenService = services.web3Services.token.readOnlyInstance(config, token);
    const tokenAsAService = services.web3Services.tokenAsAService.readOnlyInstance(config, token);

    executor.add(
      batch => tokenService.name({}, batch, (value) => {
        temp.name = value;
      }),
      batch => tokenAsAService.owner({}, batch, value => {
        temp.owner = value;
      }),
    );
    data.ownedPlatformTokens.push(temp);
  }

  for (const token of prep.tokens) {
    const tokenService = services.web3Services.token.readOnlyInstance(config, token);
    const tokenData = new VestingToken();

    tokenData.address = token;

    if (token !== EmptyAddress) {
      executor.add(
        batch => tokenService.name<string>({}, batch, response => tokenData.name = response),
        batch => tokenService.symbol<string>({}, batch, response => tokenData.symbol = response),
        batch => tokenService.decimals<NumericResult>({}, batch, response => tokenData.decimals = bn_wrap(response).toNumber()),
      );
    } else {
      tokenData.name = 'Native Token';
      tokenData.symbol = config.networkSymbol;
      tokenData.decimals = DefaultEVMNativeTokenDecimalSize;
    }

    executor.add(
      batch => vestingService.totalRewards<NumericResult>({ token: token }, batch, response => tokenData.total = bn_wrap(response)),
      batch => vestingService.availableTotalRewards<NumericResult>({ token: token }, batch, response => tokenData.available = bn_wrap(response)),
      batch => vestingService.remainingTotalRewards<NumericResult>({ token: token }, batch, response => tokenData.remaining = bn_wrap(response)),
      batch => vestingService.totalRewardsPerReleaseCycle<NumericResult>({ token: token }, batch, response => tokenData.perCycle = bn_wrap(response)),
    );

    data.tokens.push(tokenData);
  }

  for (const payeeKey in prep.payees) {
    const payee = new VestingPayee();
    payee.address = prep.payees[payeeKey];
    payee.percent = prep.payeesPercent[payeeKey];

    for (const token of prep.tokens) {
      const tokenData = new VestingPayeeToken();

      executor.add(
        batch => vestingService.rewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.total = bn_wrap(response)),
        batch => vestingService.availableRewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.available = bn_wrap(response)),
        batch => vestingService.remainingRewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.remaining = bn_wrap(response)),
        batch => vestingService.rewardsPerReleaseCycle<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.perCycle = bn_wrap(response)),
      );

      payee.tokens[token] = tokenData;
    }
    data.payees.push(payee);
  }

  for (const payeeKey in prep.controllers) {
    const payee = new VestingPayee();
    payee.address = prep.controllers[payeeKey];
    payee.percent = prep.controllersPercent[payeeKey];

    for (const token of prep.tokens) {
      const tokenData = new VestingPayeeToken();

      executor.add(
        batch => vestingService.rewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.total = bn_wrap(response)),
        batch => vestingService.availableRewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.available = bn_wrap(response)),
        batch => vestingService.remainingRewards<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.remaining = bn_wrap(response)),
        batch => vestingService.rewardsPerReleaseCycle<NumericResult>({
          token: token,
          wallet: payee.address,
        }, batch, response => tokenData.perCycle = bn_wrap(response)),
      );
      payee.tokens[token] = tokenData;
    }
    data.controllers.push(payee);
  }

  executor.add(
    batch => vestingService.PERCENT_SCALING<NumericResult>({}, batch, response => data.percentScaling = bn_wrap(response).toNumber()),
    batch => vestingService.cycleBlocks<NumericResult>({}, batch, response => data.cycleLength = bn_wrap(response)),
    batch => vestingService.VERSION<NumericResult>({}, batch, response => data.version = bn_wrap(response).toNumber()),
    batch => vestingService.finalReleaseHeight<NumericResult>({}, batch, response => data.finalReleaseHeight = bn_wrap(response)),
    batch => vestingService.initialTime<NumericResult>({}, batch, response => data.activateHeight = bn_wrap(response)),
    batch => vestingService.rewardCycles<NumericResult>({}, batch, response => data.cycles = bn_wrap(response).toNumber()),
    batch => vestingService.owner<string>({}, batch, response => data.owner = response),
  );

  await executor.execute();
  return data;
}
