import {
    type BlockchainDefinition,
    DefaultEVMNativeTokenDecimalSize,
    type NumericResult
} from "@unleashed-business/ts-web3-commons";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";
import type {ODAInfraContractRouterBuilderInterface} from "../../../commons/oda-infra-contract-router.interface.js";
import {BatchRequest} from "@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js";
import {TreasuryDeployData} from "./treasury-deploy.data.js";
import Web3 from "web3";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";

export async function loadTreasuryDeployData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    contractInfraRouter: ODAInfraContractRouterBuilderInterface,
    forWallet: string,
    data: TreasuryDeployData | undefined = undefined,
    externalBatch: BatchRequest | undefined = undefined,
): Promise<TreasuryDeployData> {
    data = data ?? new TreasuryDeployData();
    data.deployTaxDecimals = DefaultEVMNativeTokenDecimalSize;

    const connection = services.connection.getWeb3ReadOnly(config);
    const batch = externalBatch ?? new BatchRequest(connection);

    const odaRouter = contractInfraRouter.build(config);
    await services.web3Services.contractDeployer.views.deployTaxForAddress<NumericResult>(
        config, await odaRouter.contractDeployer, {
            deployer: forWallet,
            groupHash: Web3.utils.keccak256('GROUP_TREASURY'),
            typeNumber: 0
        },
        batch, x => data!.deployTaxGeneral = bn_wrap(x));
    await services.web3Services.treasuryDeployer.views.PERCENT_SCALING<NumericResult>(
        config, await odaRouter.treasuryDeployer, {},
        batch, response => data!.serviceTaxScaling = bn_wrap(response).toNumber(),
    );
    await services.web3Services.treasuryDeployer.views
        .serviceTax<NumericResult>(
            config,
            await odaRouter.treasuryDeployer,
            {},
            batch,
            x => data!.serviceTax = bn_wrap(x),
        );


    return data;
}