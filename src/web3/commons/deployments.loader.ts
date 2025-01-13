import type DeploymentBase from '../../web2/data/deployment/base/deployment.base.js';
import type { BlockchainDefinition } from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../loader/shared/loader-service-provider.interface.js';
import type { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import { loadOwnedObjects } from './owned-objects.loader.js';
import { BatchExecutor } from '../utils/batch.executor.js';
import { web3AddressEq } from './funcs.js';

export async function loadDeploymentsList<ListItem extends {
  address: string,
  owner: string,
  ownerName: string,
  deployedOn: Date
}, ListData extends { list: ListItem[] }, Deployment extends DeploymentBase>(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  targetWallet: string,
  deploymentType: string,
  listType: { new(): ListData },
  listItemType: { new(): ListItem },
  loadItemFunc: (item: ListItem, deployment: Deployment, services: LoaderServiceProviderInterface, batch: BatchRequest) => Promise<void>,
): Promise<ListData> {
  const data = new listType();
  const ownershipData = await loadOwnedObjects(targetWallet, config, services, deploymentType);

  if (ownershipData.ownedAddresses.length <= 0) {
    return data;
  }

  const deployments = await services.httpServices.deployment.fetchMulti<Deployment>(config.networkId, ownershipData.ownedAddresses);

  const executor = BatchExecutor.new(config, services.connection);

  for (const owner of Object.keys(ownershipData.objectForOwnerMap)) {
    const objectsForOwner = ownershipData.objectForOwnerMap[owner];

    for (const objectItem of objectsForOwner) {
      const deployment = deployments[objectItem];

      const objectData: ListItem = new listItemType();
      objectData.address = objectItem;
      objectData.owner = owner;
      objectData.deployedOn = deployment.deployedOn;

      executor.add(batch => loadItemFunc(objectData, deployment, services, batch));

      if (!web3AddressEq(owner, targetWallet)) {
        executor.add(batch => services.web3Services.decentralizedEntityInterface.views.name<string>(config, objectData.owner, {}, batch, (x: string) => objectData.ownerName = x));
      } else {
        objectData.ownerName = 'My Wallet';
      }

      data.list.push(objectData);
    }
  }

  await executor.execute({ timeout: 20_000 });

  data.list = data.list.sort((a, b) => {
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