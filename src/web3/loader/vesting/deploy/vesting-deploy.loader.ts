import { type BlockchainDefinition, type NumericResult } from '@unleashed-business/ts-web3-commons';
import type { LoaderServiceProviderInterface } from '../../shared/loader-service-provider.interface.js';
import { VestingDeployData } from './vesting-deploy.data.js';
import { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';
import { bn_wrap } from '@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js';
import type { ODAInfraContractRouterBuilderInterface } from '../../../commons/oda-infra-contract-router.interface.js';
import Web3 from 'web3';

export async function loadVestingDeployData(
  config: BlockchainDefinition,
  services: LoaderServiceProviderInterface,
  contractInfraRouter: ODAInfraContractRouterBuilderInterface,
  forWallet: string,
): Promise<VestingDeployData> {
  const data = new VestingDeployData();
  const connection = services.connection.getWeb3ReadOnly(config);
  const batch = new BatchRequest(connection);
  const router = contractInfraRouter.build(config);

  const queries: Promise<any>[] = [];

  const vestingServiceTax = services.web3Services.vestingDeployer.views.vestingServiceTax<NumericResult>(
    config,
    await router.vestingDeployer,
    {}, batch, response => {
      data.serviceTax = bn_wrap(response).toNumber() / 10;
    });

  const contractDeployer = await router.contractDeployer;
  const vestingDeployTaxForAddress = services.web3Services.contractDeployer.views
    .deployTaxForAddress<NumericResult>(
      config,
      contractDeployer,
      { deployer: forWallet, groupHash: Web3.utils.keccak256('GROUP_VESTING'), typeNumber: 0 },
      batch,
      x => data.deployTaxGeneral = bn_wrap(x),
    );

  queries.push(vestingServiceTax, vestingDeployTaxForAddress);

  await Promise.all(queries);
  return data;
}
