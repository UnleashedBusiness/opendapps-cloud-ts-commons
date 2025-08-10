import type { BlockchainDefinition } from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../loader/shared/loader-service-provider.interface.js';

//TODO Change change deployment type to enum instead of string
export async function loadOwnedObjects(
  targetWallet: string,
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  deploymentType: string,
): Promise<OwnershipDescription> {
  const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, targetWallet);
  const owners = [targetWallet, ...organizations];
  const objectList = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, deploymentType);

  return { ownedAddresses: Object.values(objectList).flat(), objectForOwnerMap: objectList };
}

type OwnershipDescription = {
  ownedAddresses: string[];
  objectForOwnerMap: Record<string, string[]>;
}