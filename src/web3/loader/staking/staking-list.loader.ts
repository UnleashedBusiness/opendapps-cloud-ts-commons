import {
    BlockchainDefinition,
    type NumericResult,
    type ReadOnlyWeb3Connection
} from "@unleashed-business/ts-web3-commons";
import {StakingDataForList, StakingListData} from "./staking-list.data.js";
import type {HttpServicesContainer} from "../../../http-services.container.js";
import type StakingDeployment from "../../../web2/data/deployment/staking-deployment.js";
import type {Web3ServicesContainer} from "../../../web3-services.container.js";
import {bigNumberPipe} from "@unleashed-business/ts-web3-commons/dist/utils/contract-pipe.utils.js";

export async function loadStakingListData(
    config: BlockchainDefinition,
    connection: ReadOnlyWeb3Connection,
    httpServices: HttpServicesContainer,
    web3Services: Web3ServicesContainer,
    forWallet: string,
): Promise<StakingListData> {
    const organizations = await httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
    const poolOwnerQuery = [forWallet, ...organizations];
    const stakingPools = await httpServices.stakingAsAService.ownerOfMulti(config.networkId, poolOwnerQuery);
    const stakingPoolsFlattened = Object.values(stakingPools).flat();
    const stakingPoolDeployments = stakingPoolsFlattened.length > 0
        ? await httpServices.deployment.fetchMulti<StakingDeployment>(config.networkId, stakingPoolsFlattened)
        : {} as Record<string, StakingDeployment>
    ;

    const data = new StakingListData();

    const web3Connection = connection.getWeb3ReadOnly(config);
    let deployments: StakingDeployment[] = [];
    const ownersBatch = new web3Connection.BatchRequest();
    let owners: { isEntity: boolean, address: string }[] = [];

    for (const entity of organizations) {
        for (const pool of stakingPools[entity]) {
            deployments.push(stakingPoolDeployments[pool]);
            const owner = {isEntity: true, address: ''};
            owners.push(owner);

            web3Services.stakingAsAService.views.owner<string>(config, pool, {}, ownersBatch)
                .then(value => owner.address = value);
        }
    }

    for (const pool of stakingPools[forWallet]) {
        deployments.push(stakingPoolDeployments[pool]);
        const owner = {isEntity: false, address: ''};
        owners.push(owner);

        web3Services.stakingAsAService.views.owner<string>(config, pool, {}, ownersBatch)
            .then(value => owner.address = value);
    }
    await ownersBatch.execute();

    const batch = new web3Connection.BatchRequest();
    for (const poolKey in deployments) {
        const deployment = deployments[poolKey];

        const pool: StakingDataForList = new StakingDataForList();
        pool.address = deployment.address;
        pool.tokenAddress = deployment.token;
        pool.owner = owners[poolKey].address;
        pool.deployedOn = deployment.deployedOn;

        const stakingContract = web3Services.stakingAsAService.readOnlyInstance(config, pool.address);
        const tokenContract = web3Services.tokenAsAService.readOnlyInstance(config, deployment.token);

        tokenContract.name<string>({}, batch).then(x => pool.tokenName = x);
        tokenContract.symbol<string>({}, batch).then(x => pool.tokenSymbol = x);
        tokenContract.decimals<NumericResult>({}, batch).then(bigNumberPipe).then(x => pool.tokenDecimals = x.toNumber());
        tokenContract.totalSupply<NumericResult>({}, batch).then(bigNumberPipe).then(x => pool.tokenSupply = x);

        stakingContract.totalVaultShares<NumericResult>({}, batch).then(bigNumberPipe).then(x => pool.totalStaked = x)

        if (owners[poolKey].isEntity) {
            web3Services.decentralizedEntityInterface.views
                .name<string>(config, pool.owner, {})
                .then(x => pool.ownerName = x);
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