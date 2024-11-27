import {
    BlockchainDefinition,
    DefaultEVMNativeTokenDecimalSize,
    EmptyAddress,
    type NumericResult
} from "@unleashed-business/ts-web3-commons";
import type {LoaderServiceProviderInterface} from "../../shared/loader-service-provider.interface.js";
import type {ODAInfraContractRouterBuilderInterface} from "../../../commons/oda-infra-contract-router.interface.js";
import {PayeePocket, RewardsPayee, RewardToken, TreasuryManageData} from "./treasury-manage.data.js";
import {BatchExecutor} from "../../../utils/batch.executor.js";
import {loadTreasuryDeployData} from "../deploy/treasury-deploy.loader.js";
import {bn_wrap} from "@unleashed-business/ts-web3-commons/dist/utils/big-number.utils.js";
import Web3 from "web3";
import type {BatchRequest} from "@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js";

type PayeeExtendedReturnType = {
    payeesReturn: string[],
    pocketsCount: number[],
    pocketList: string[],
    pocketNames: string[],
    pocketPercents: number[]
};

export async function loadTreasuryManageData(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    contractInfraRouter: ODAInfraContractRouterBuilderInterface,
    treasuryAddress: string,
    forWallet: string,
): Promise<TreasuryManageData> {
    const data = new TreasuryManageData();

    data.address = treasuryAddress;

    const odaRouter = contractInfraRouter.build(config);
    const contractDeployer = await odaRouter.contractDeployer;
    const organizations = await services.httpServices.decentralizedEntity.memberOf(config.networkId, forWallet);
    const owners = [forWallet, ...organizations];

    let bootstrapData: {
        payeesData: PayeeExtendedReturnType,
        payees: string[],
        tokens: string[],
        controller: string,
    } = {} as any;

    const treasuryContract = services.web3Services.treasuryService.readOnlyInstance(config, treasuryAddress);

    await BatchExecutor.new(config, services.connection)
        .add(
            (batch) => loadTreasuryDeployData(config, services, contractInfraRouter, forWallet, data, batch),
            (batch) => treasuryContract.getPayees<string[]>({}, batch, response => bootstrapData.payees = response),
            (batch) => treasuryContract.getRewardTokens<string[]>({}, batch, response => bootstrapData.tokens = response),
            (batch) => treasuryContract.controller<string>({}, batch, response => bootstrapData.controller = response),
            (batch) => treasuryContract.owner<string>({}, batch, response => data.owner = response),
            (batch) => treasuryContract.PERCENT_SCALING<NumericResult>({}, batch, response => data.percentScaling = bn_wrap(response ?? 10).toNumber(), (_) => {
                data.percentScaling = 10
            }),
            (batch) => services.web3Services.contractDeployer.views.isUpgradeable<boolean>(config, contractDeployer, {_contract: data.address}, batch, (x) => (data.isUpgradeable = x)),
        ).execute({timeout: 20_000});

    bootstrapData.payeesData = await treasuryContract.getPayeesExtended<PayeeExtendedReturnType>({}) as PayeeExtendedReturnType;

    if (bootstrapData.payeesData === undefined) {
        bootstrapData.payeesData = {payeesReturn: [], pocketList: [], pocketNames: [], pocketPercents: [], pocketsCount: []};

        const payeeExecutor = BatchExecutor.new(config, services.connection);

        for (let payee of bootstrapData.payees) {
            bootstrapData.payeesData.payeesReturn.push(payee);
            bootstrapData.payeesData.pocketsCount.push(1);
            bootstrapData.payeesData.pocketNames.push(Web3.utils.padRight(Web3.utils.fromAscii("Default"), 64));

            payeeExecutor.add(
                (batch) => treasuryContract.payeePercent<NumericResult>({account: payee}, batch, response => bootstrapData.payeesData.pocketPercents.push(bn_wrap(response).toNumber())),
                (batch) => treasuryContract.payeePocket<string>({account: payee}, batch, response => bootstrapData.payeesData.pocketList.push(response)),
            );
        }

        await payeeExecutor.execute({timeout: 10_000});
    }

    data.controller = bootstrapData.controller;

    if (bootstrapData.payeesData.payeesReturn.length == 0 && bootstrapData.tokens.length == 0) {
        return data;
    }

    let pocketKey = 0;
    for (const payeeKey in bootstrapData.payeesData!.payeesReturn) {
        const payee = new RewardsPayee();
        payee.owner = bootstrapData.payeesData!.payeesReturn[payeeKey];

        for (let j = 0; j < bn_wrap(bootstrapData.payeesData.pocketsCount[payeeKey]).toNumber(); j++) {
            const pocket = new PayeePocket();
            const nameBytes = bootstrapData.payeesData!.pocketNames[pocketKey].substring(2);
            let name = "";
            for (let i = 0; i < nameBytes.length; i += 2) {
                const bytes = nameBytes.substring(i, i + 2);
                if (bytes !== "00") {
                    name += String.fromCharCode(parseInt(bytes, 16));
                }
            }
            pocket.name = name === '' ? "Default" : name;

            pocket.address = bootstrapData.payeesData!.pocketList[pocketKey];
            pocket.owner = payee.owner;
            pocket.percent = bn_wrap(bootstrapData.payeesData!.pocketPercents[pocketKey]).toNumber();

            payee.pockets.push(pocket);
            pocketKey++;
        }

        const owner = owners.filter(x => Web3.utils.toChecksumAddress(x) === Web3.utils.toChecksumAddress(payee.owner)).pop();
        if (owner !== undefined) {
            data.connectedPocketOwners.push(payee);
        }

        data.payees.push(payee);
    }

    const rewardsExecutor = BatchExecutor.new(config, services.connection);

    for (const owner of data.connectedPocketOwners) {
        if (Web3.utils.toChecksumAddress(owner.owner) !== Web3.utils.toChecksumAddress(forWallet)) {
            rewardsExecutor.add(
                batch => services.web3Services.decentralizedEntityInterface.views
                    .name<string>(config, owner.name, {}, batch, (x: string) => owner.name = x)
            )
        } else {
            owner.name = "My Wallet"
        }
    }

    for (const tokenKey in bootstrapData.tokens) {
        rewardsExecutor.add(
            batch => localTokenHoldingsInfo(config, services, data, bootstrapData.tokens[tokenKey], treasuryAddress, data.payees, batch)
        )
    }

    await rewardsExecutor.execute({timeout: 30_000});

    return data;
}

async function localTokenHoldingsInfo(
    config: BlockchainDefinition,
    services: LoaderServiceProviderInterface,
    data: TreasuryManageData,
    address: string,
    treasury: string,
    payees: RewardsPayee[],
    batch: BatchRequest,
) {
    const baseTokenAmount: RewardToken = new RewardToken();
    baseTokenAmount.address = address;

    for (const payee of payees) {
        for (const pocketKey in payee.pockets)
            await services.web3Services.treasuryService.views
                .balanceOfExtended<NumericResult>(config, treasury, {token: address, account: payee.owner, index: pocketKey}, batch,
                    (result) => {
                        baseTokenAmount.balance.push({
                            pocket: payee.pockets[pocketKey].address,
                            amount: bn_wrap(result ?? 0),
                        });
                    });
    }

    data.rewardTokens.push(baseTokenAmount);

    if (Web3.utils.toChecksumAddress(address) === Web3.utils.toChecksumAddress(EmptyAddress)) {
        baseTokenAmount['ticker'] = config.networkSymbol;
        baseTokenAmount['scaling'] = DefaultEVMNativeTokenDecimalSize;
        baseTokenAmount['name'] = 'Native Token';
    } else {
        const token = services.web3Services.token.readOnlyInstance(config, baseTokenAmount.address);

        await token.symbol<string>({}, batch, (result) => (baseTokenAmount.ticker = result));
        await token.decimals<NumericResult>({}, batch, (result) => (baseTokenAmount.scaling = bn_wrap(result).toNumber()));
        await token.name<string>({}, batch, (result) => {
            baseTokenAmount['name'] = result;

            const filteredTokens = data.rewardTokens.filter(
                (y: any) => Web3.utils.toChecksumAddress(y.address) === Web3.utils.toChecksumAddress(baseTokenAmount.address),
            );

            if (filteredTokens.length > 0) {
                return;
            }

            data.rewardTokens.push(baseTokenAmount);
        });
    }
}