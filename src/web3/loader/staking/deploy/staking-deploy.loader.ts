import {StakingDeployData} from "./staking-deploy.data.js";
import {
    BlockchainDefinition, DefaultEVMNativeTokenDecimalSize,
    type NumericResult,
} from "@unleashed-business/ts-web3-commons";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";
import {BatchRequest} from "@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js";
import Web3 from "web3";
import type {
    ODAInfraContractRouterBuilderInterface,
} from "../../../commons/oda-infra-contract-router.interface.js";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";

export async function loadStakingDeployData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    contractInfraRouter: ODAInfraContractRouterBuilderInterface,
    forWallet: string,
    data: StakingDeployData | undefined = undefined,
    externalBatch: BatchRequest | undefined = undefined,
): Promise<StakingDeployData> {
    data = data ?? new StakingDeployData();
    data.deployTaxDecimals = DefaultEVMNativeTokenDecimalSize;

    const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
    const tokenOwnerQuery = [forWallet, ...organizations];
    const tokens = await services.httpServices.ownership.ownerOfMulti(config.networkId, tokenOwnerQuery, 'TokenAsAService');
    const tokensFlatList = Object.values(tokens).flat();

    const connection = services.connection.getWeb3ReadOnly(config);
    const batch = externalBatch ?? new BatchRequest(connection);

    for (let token of tokensFlatList) {
        const temp: any = {address: token};
        await services.web3Services.token.views.name(config, token, {}, batch, (value) => {
            temp.name = value;
        });
        await services.web3Services.tokenAsAService.views.owner(config, token, {}, batch, value => {
            temp.owner = value;
            data!.ownedPlatformTokens.push(temp);
        })
    }

    await services.web3Services.stakingAsAServiceDeployer.views.PERCENT_SCALING<NumericResult>(
        config, await contractInfraRouter.build(config).stakingAsAServiceDeployer, {}, batch, response => data!.serviceTaxScaling = bn_wrap(response).toNumber()
    ).then(x => bn_wrap(x as NumericResult));

    await services.web3Services.stakingAsAServiceDeployer.views
        .serviceTax<NumericResult>(
            config,
            await contractInfraRouter.build(config).stakingAsAServiceDeployer,
            {},
            batch,
            x => data!.serviceTax = bn_wrap(x)
        );

    await services.web3Services.contractDeployer.views
        .deployTaxForAddress<NumericResult>(
            config,
            await contractInfraRouter.build(config).stakingAsAServiceDeployer,
            {deployer: forWallet, groupHash: Web3.utils.keccak256('Staking'), typeNumber: 0},
            batch,
            x => data!.deployTaxGeneral = bn_wrap(x)
        );

    return data;
}
