import {
    BlockchainDefinition,
    DefaultEVMNativeTokenDecimals,
    EmptyAddress,
    type NumericResult
} from "@unleashed-business/ts-web3-commons";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";
import {TreasuryDataForList, TreasuryListData} from "./treasury-list.data.js";
import {BatchExecutor} from "../../../utils/batch.executor.js";
import Web3 from "web3";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";

export async function loadTreasuryListData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    forWallet: string,
): Promise<TreasuryListData> {
    const data = new TreasuryListData();
    const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
    const owners = [forWallet, ...organizations];
    const treasuries = await services.httpServices.ownership.ownerOfMulti(config.networkId, owners, 'Treasury');
    const treasuriesFlattened = Object.values(treasuries).flat();

    if (treasuriesFlattened.length <= 0) {
        return data;
    }
    const deployments = await services.httpServices.deployment.fetchMulti(config.networkId, treasuriesFlattened);

    const executor = BatchExecutor.new(config, services.connection);

    for (const owner of Object.keys(treasuries)) {
        const treasuriesForOwner = treasuries[owner];
        for (const treasury of treasuriesForOwner) {
            const deployment = deployments[treasury];

            const treasuryData: TreasuryDataForList = new TreasuryDataForList();
            treasuryData.address = treasury;
            treasuryData.owner = owner;
            treasuryData.deployedOn = deployment.deployedOn;
            treasuryData.nativeBalanceDecimals = DefaultEVMNativeTokenDecimals;

            executor.add(
                (batch) => services.web3Services.treasuryService.views.available<NumericResult>(
                    config, treasury, {token: EmptyAddress},
                    batch, response => treasuryData.nativeBalance = bn_wrap(response))
            );
            if (Web3.utils.toChecksumAddress(owner) !== Web3.utils.toChecksumAddress(forWallet)) {
                executor.add(
                    (batch) => services.web3Services.decentralizedEntityInterface.views.name<string>(
                        config, treasuryData.owner, {},
                        batch, (x: string) => treasuryData.ownerName = x)
                );
            } else {
                treasuryData.ownerName = "My Wallet"
            }

            data.treasuries.push(treasuryData);
        }
    }

    await executor.execute({timeout: 20_000});

    data.treasuries = data.treasuries.sort((a, b) => {
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