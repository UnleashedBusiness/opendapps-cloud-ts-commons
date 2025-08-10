import {BlockchainDefinition} from '@unleashed-business/ts-web3-commons';
import type {LoaderServiceProviderInterface} from '../../shared/loader-service-provider.interface.js';
import {LiquidityMiningDataForList, LiquidityMiningListData} from './liquidity-mining-list.data.js';
import {loadDeploymentsList} from '../../../commons/deployments.loader.js';
import type {LiquidityMiningDeployment} from '../../../../web2/data/deployment/liquidity-mining-deployment.js';

export async function loadLiquidityMiningListData(config: BlockchainDefinition, services: LoaderServiceProviderInterface, targetWallet: string): Promise<LiquidityMiningListData> {
    return loadDeploymentsList<LiquidityMiningDataForList, LiquidityMiningListData, LiquidityMiningDeployment>(
        config,
        services,
        targetWallet,
        'LiquidityMining',
        LiquidityMiningListData,
        LiquidityMiningDataForList,
        async (item, deployment, globals1, batch1) => {
            item.tokenAddress = deployment.token;
            await globals1.web3Services.tokenAsAService.views.name<string>(config, deployment.token, {}, batch1, response => item.tokenName = response);
        },
    );
}
