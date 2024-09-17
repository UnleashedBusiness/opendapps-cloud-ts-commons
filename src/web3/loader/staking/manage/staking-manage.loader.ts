import {
    BlockchainDefinition,
    DefaultEVMNativeTokenDecimalSize,
    EmptyAddress,
    type NumericResult
} from "@unleashed-business/ts-web3-commons";
import {StakingManageData} from "./staking-manage.data.js";
import {BatchRequest} from "@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js";
import {loadStakingDeployData} from "../deploy/staking-deploy.loader.js";
import type {
    ODAInfraContractRouterBuilderInterface,
} from "../../../commons/oda-infra-contract-router.interface.js";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";
import Web3 from "web3";

export async function loadStakingManageData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    contractInfraRouter: ODAInfraContractRouterBuilderInterface,
    stakingAddress: string,
    forWallet: string,
): Promise<StakingManageData> {
    const data = new StakingManageData();

    const connection = services.connection.getWeb3ReadOnly(config);
    const batch = new BatchRequest(connection);

    await loadStakingDeployData(config, services, contractInfraRouter, forWallet, data, batch);
    if (stakingAddress === EmptyAddress) {
        await batch.execute({timeout: 10_000});

        return data;
    }

    const contractDeployer = await contractInfraRouter.build(config).contractDeployer;

    data.address = stakingAddress;
    let preloaded: any = {};

    const preloadBatch = new BatchRequest(connection);

    await services.web3Services.contractDeployer.views
        .isUpgradeable<boolean>(config, contractDeployer, {_contract: data.address!}, batch, (x) => (data.isUpgradeable = x));

    const saas = services.web3Services.stakingAsAService.readOnlyInstance(config, stakingAddress);

    await Promise.all([
        saas.rewardTokens<string[]>({}, batch, x => preloaded.rewardTokens = x as Record<number, string>),
        saas.stakingToken<string>({}, batch, x => data.stakingToken.address = x as string),
        saas.owner<string>({}, batch, x => data.owner = x as string),
    ]);

    await preloadBatch.execute({timeout: 10_000});

    const batchQueries: Promise<any>[] = [
        saas.minStake<NumericResult>({}, batch, (result) => (data.minStake = bn_wrap(result))),
        services.web3Services.token.views.decimals<NumericResult>(
            config, data.stakingToken.address, {},
            batch, (result) => (data.stakingToken.decimals = bn_wrap(result).toNumber())
        ),
        services.web3Services.token.views
            .symbol<string>(
                config, data.stakingToken.address, {},
                batch, (result) => (data.stakingToken.ticker = result)),
        services.web3Services.token.views
            .name<string>(
                config, data.stakingToken.address, {},
                batch, (result) => (data.stakingToken.name = result)
            ),
        saas.maxStake<NumericResult>({}, batch, (result) => data.maxStake = bn_wrap(result)),
        saas.epochBlockDistance<NumericResult>({}, batch, result => data.blockDistanceBetweenEpochs = bn_wrap(result).toNumber()),
        saas.epoch<NumericResult>({}, batch, (result) => data.currentEpoch = bn_wrap(result).toNumber()),
        saas.locksEnabled<boolean>({}, batch, (result) => (data.lockingEnabled = result)),
        saas.maxLockEpochs<NumericResult>({}, batch, (result) => (data.maxEpochLockLength = bn_wrap(result).toNumber())),
        saas.minLockEpochs<NumericResult>({}, batch, (result) => (data.minEpochLockLength = bn_wrap(result).toNumber())),
        saas.lockEpochRewardRate<NumericResult>({}, batch, (result) => (data.rewardMultiplierPerEpochLocked = bn_wrap(result).dividedBy(10 ** 12))),
        saas.epochLastRaise<NumericResult>({}, batch, (result) => (data.blockOfLastStateChangeEpochRaise = bn_wrap(result).toNumber())),
        saas.epochPrev<NumericResult>({}, batch, (result) => data.lastStateChangeEpoch = bn_wrap(result).toNumber()),
        saas.rewardProviders({}, batch, (result) => {
            data.externalRewardProviders = (result as string[]).map((x) => {
                let nameOfIt = '';
                switch (Web3.utils.toChecksumAddress(x)) {
                    case Web3.utils.toChecksumAddress(data.stakingToken.address):
                        nameOfIt = data.stakingToken.name + ' Tokenomics';
                        break;
                }
                return {address: x, name: nameOfIt};
            });
        })
    ];

    for (const key in Object.keys(preloaded.rewardTokens)) {
        batchQueries.push(
            saas.totalAvailableRewards<NumericResult>(
                {token: preloaded.rewardTokens[key]}, batch, (result) => (data.rewardTokens[key].totalAvailableRewards = bn_wrap(result))
            ),
            saas.epochAvailableRewards<NumericResult>(
                {token: preloaded.rewardTokens[key]}, batch, (result) => (data.rewardTokens[key].rewardsForCurrentEpochIncrement = bn_wrap(result))
            ),
            saas.maxRewardsPerEpochForToken<NumericResult>(
                {token: preloaded.rewardTokens[key]}, batch, (result) => (data.rewardTokens[key].maxPerEpoch = bn_wrap(result))
            )
        )

        if (preloaded.rewardTokens[key] !== EmptyAddress) {
            batchQueries.push(
                services.web3Services.token.views.symbol(
                    config, preloaded.rewardTokens[key], {},
                    batch, (result) => (data.rewardTokens[key].ticker = result as string)
                ),
                services.web3Services.token.views.name(
                    config, preloaded.rewardTokens[key], {},
                    batch, (result) => (data.rewardTokens[key].name = result as string)
                ),
                services.web3Services.token.views.decimals<NumericResult>(
                    config, preloaded.rewardTokens[key], {},
                    batch, (result) => (data.rewardTokens[key].decimals = bn_wrap(result).toNumber())
                )
            );
        } else {
            data.rewardTokens[key].ticker = config.networkSymbol;
            data.rewardTokens[key].name = 'Native ' + config.networkSymbol;
            data.rewardTokens[key].decimals = DefaultEVMNativeTokenDecimalSize;
        }
    }

    await Promise.all(batchQueries);

    await batch.execute({timeout: 10_000});

    return data;
}
