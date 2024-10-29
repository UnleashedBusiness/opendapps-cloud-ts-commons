import type { BlockchainDefinition } from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import { VestingDataForList, VestingListData } from './vesting-list.data.js';
import { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import Web3 from 'web3';

export async function loadVestingListData(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  forWallet: string,
): Promise<VestingListData> {
  const data = new VestingListData();
  const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
  const owners = [forWallet, ...organizations];
  const vestingList = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, 'Vesting');
  const vestingListFlattened = Object.values(vestingList).flat();

  if (vestingListFlattened.length <= 0) {
    return data;
  }

  const deployments = await services.httpServices.deployment.fetchMulti(config.networkId, vestingListFlattened);
  const connection = services.connection.getWeb3ReadOnly(config);
  const batch = new BatchRequest(connection);

  const queries: Promise<any>[] = [];

  for (const owner of Object.keys(vestingList)) {
    const vestingForOwner = vestingList[owner];

    for (const vesting of vestingForOwner) {
      const deployment = deployments[vesting];
      const vestingData: VestingDataForList = new VestingDataForList();

      vestingData.address = vesting;
      vestingData.owner = owner;
      vestingData.deployedOn = deployment.deployedOn;

      const payees = services.web3Services.vestingService.views.payees<any[][]>(config, vesting, {}, batch, response => vestingData.participants = response[0]);
      const rewardTokens = services.web3Services.vestingService.views.rewardTokens<string[]>(config, vesting, {}, batch, response => vestingData.tokens = response);

      queries.push(payees, rewardTokens);

      if (Web3.utils.toChecksumAddress(owner) !== Web3.utils.toChecksumAddress(forWallet)) {
        const name = services.web3Services.decentralizedEntityInterface.views.name<string>(
          config, vestingData.owner, {}, batch, (x: string) => vestingData.ownerName = x,
        );

        queries.push(name);
      } else {
        vestingData.ownerName = 'My Wallet';
      }

      data.vestingList.push(vestingData);
    }
  }

  await Promise.all(queries);
  await batch.execute({ timeout: 20_000 });

  data.vestingList = data.vestingList.sort((a, b) => {
    if (b.deployedOn.valueOf() < a.deployedOn.valueOf()) {
      return -1;
    } else if (b.deployedOn.valueOf() > a.deployedOn.valueOf()) {
      return 1;
    } else {
      return 0;
    }
  });

  return data;
}
