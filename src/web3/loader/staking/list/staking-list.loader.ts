import {
    BlockchainDefinition,
    type NumericResult,
} from "@unleashed-business/ts-web3-commons";
import {StakingDataForList, StakingListData} from "./staking-list.data.js";
import type StakingDeployment from "../../../../web2/data/deployment/staking-deployment.js";
import {BatchRequest} from "@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";

export async function loadStakingListData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    forWallet: string,
): Promise<StakingListData> {
    const connection = services.connection.getWeb3ReadOnly(config);

    const data = new StakingListData();

    const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
    const poolOwnerQuery = [forWallet, ...organizations];
    const stakingPools = await services.httpServices.ownership.ownerOfMulti(config.networkId, poolOwnerQuery, 'Staking');
    const stakingPoolsFlattened = Object.values(stakingPools).flat();
    const stakingPoolDeployments = stakingPoolsFlattened.length > 0
        ? await services.httpServices.deployment.fetchMulti<StakingDeployment>(config.networkId, stakingPoolsFlattened)
        : {} as Record<string, StakingDeployment>

    let deployments: StakingDeployment[] = [];
    const ownersBatch = new BatchRequest(connection);
    let owners: { isEntity: boolean, address: string }[] = [];

    for (const organizationAddress of organizations) {
        for (const stakingPoolAddress of stakingPools[organizationAddress]) {
            deployments.push(stakingPoolDeployments[stakingPoolAddress]);
            const owner = {isEntity: true, address: ''};
            owners.push(owner);

            await services.web3Services.stakingAsAService.views.owner<string>(
                config, stakingPoolAddress, {}, ownersBatch, value => owner.address = value
            );
        }
    }

    for (const stakingPoolAddress of stakingPools[forWallet]) {
        deployments.push(stakingPoolDeployments[stakingPoolAddress]);
        const owner = {isEntity: false, address: ''};
        owners.push(owner);

        await services.web3Services.tokenAsAService.views.owner<string>(
            config, stakingPoolAddress, {}, ownersBatch, value => owner.address = value
        );
    }

    await ownersBatch.execute({timeout: 10_000});

    const batch = new BatchRequest(connection);
    for (const poolKey in deployments) {
        const deployment = deployments[poolKey];

        const pool: StakingDataForList = new StakingDataForList();
        pool.address = deployment.address;
        pool.tokenAddress = deployment.token;
        pool.owner = owners[poolKey].address;
        pool.deployedOn = deployment.deployedOn;

        const stakingContract = services.web3Services.stakingAsAService.readOnlyInstance(config, pool.address);
        const tokenContract = services.web3Services.tokenAsAService.readOnlyInstance(config, deployment.token);

        await tokenContract.name<string>({}, batch, x => pool.tokenName = x);
        await tokenContract.symbol<string>({}, batch, x => pool.tokenSymbol = x);
        await tokenContract.decimals<NumericResult>({}, batch, x => pool.tokenDecimals = bn_wrap(x).toNumber());
        await tokenContract.totalSupply<NumericResult>({}, batch, x => pool.tokenSupply = bn_wrap(x));

        await stakingContract.totalVaultShares<NumericResult>({}, batch, x => pool.totalStaked = bn_wrap(x));

        if (owners[poolKey].isEntity) {
            await services.web3Services.decentralizedEntityInterface.views.name<string>(config, pool.owner, {}, batch, x => pool.ownerName = x);
        } else {
            pool.ownerName = "My Wallet"
        }

        data.stakingPools.push(pool);
    }

    await batch.execute({timeout: 20_000});

    data.stakingPools = data.stakingPools.sort((a, b) => {
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