import {
    type OpenDAppsCloudRouterAbiFunctional
} from '@unleashed-business/opendapps-cloud-ts-abi/dist/abi/opendapps-cloud-router.abi.js';
import type {
    AssetBackingAbiFunctional,
    BaselineInsuranceServiceDeployerAbiFunctional,
    ContractDeployerAbiFunctional,
    DecentralizedEntityDeployerAbiFunctional,
    DecentralizedEntityInterfaceAbiFunctional, DynamicTokenomicsAbiFunctional, InflationAbiFunctional,
    MultiSignEntityAbiFunctional,
    MultiSignSharesEntityAbiFunctional,
    OwnershipNFTCollectionAbiFunctional,
    OwnershipSharesNFTCollectionAbiFunctional,
    ProposalGovernorInterfaceAbiFunctional,
    ReferralsEngineAbiFunctional,
    SingleOwnerEntityAbiFunctional,
    StakingAsAServiceAbiFunctional,
    StakingAsAServiceDeployerAbiFunctional,
    TokenAsAServiceAbiFunctional,
    TokenAsAServiceDeployerAbiFunctional,
    TokenLiquidityTreasuryAbiFunctional,
    TokenRewardsTreasuryAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi";
import type {Erc20AbiFunctional} from '@unleashed-business/ts-web3-commons/dist/abi/erc20.abi.js';
import type {UniswapRouterAbiFunctional} from '@unleashed-business/ts-web3-commons/dist/abi/uniswap-router.abi.js';
import type {UniswapPairAbiFunctional} from '@unleashed-business/ts-web3-commons/dist/abi/uniswap-pair.abi.js';
import type {UniswapFactoryAbiFunctional} from '@unleashed-business/ts-web3-commons/dist/abi/uniswap-factory.abi.js';
import type {WETHAbiFunctional} from '@unleashed-business/ts-web3-commons/dist/abi/weth.abi.js';
import {Web3Contract} from '@unleashed-business/ts-web3-commons';
import type {
    PresaleServiceAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi/dist/abi/presale-service.abi.js";
import {
    type PresaleServiceDeployerAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi/dist/abi/presale-service-deployer.abi.js";

export class Web3ServicesContainer {
    constructor(
        public readonly openDAppsCloudRouter: Web3Contract<OpenDAppsCloudRouterAbiFunctional>,
        public readonly baselineInsuranceDeployerContract: Web3Contract<BaselineInsuranceServiceDeployerAbiFunctional>,
        public readonly assetBackingContract: Web3Contract<AssetBackingAbiFunctional>,
        public readonly decentralizedEntityDeployer: Web3Contract<DecentralizedEntityDeployerAbiFunctional>,
        public readonly tokenAsAServiceDeployer: Web3Contract<TokenAsAServiceDeployerAbiFunctional>,
        public readonly stakingAsAServiceDeployer: Web3Contract<StakingAsAServiceDeployerAbiFunctional>,
        public readonly decentralizedEntityInterface: Web3Contract<DecentralizedEntityInterfaceAbiFunctional>,
        public readonly governorInterface: Web3Contract<ProposalGovernorInterfaceAbiFunctional>,
        public readonly singleOwnerEntity: Web3Contract<SingleOwnerEntityAbiFunctional>,
        public readonly multiSignEntity: Web3Contract<MultiSignEntityAbiFunctional>,
        public readonly multiSignSharesEntity: Web3Contract<MultiSignSharesEntityAbiFunctional>,
        public readonly token: Web3Contract<Erc20AbiFunctional>,
        public readonly tokenAsAService: Web3Contract<TokenAsAServiceAbiFunctional>,
        public readonly stakingAsAService: Web3Contract<StakingAsAServiceAbiFunctional>,
        public readonly dymanicTokenomics: Web3Contract<DynamicTokenomicsAbiFunctional>,
        public readonly inflation: Web3Contract<InflationAbiFunctional>,
        public readonly tokenLiquidityTreasury: Web3Contract<TokenLiquidityTreasuryAbiFunctional>,
        public readonly tokenRewardsTreasury: Web3Contract<TokenRewardsTreasuryAbiFunctional>,
        public readonly uniswapRouter: Web3Contract<UniswapRouterAbiFunctional>,
        public readonly uniswapPair: Web3Contract<UniswapPairAbiFunctional>,
        public readonly uniswapFactory: Web3Contract<UniswapFactoryAbiFunctional>,
        public readonly ownershipNFTCollection: Web3Contract<OwnershipNFTCollectionAbiFunctional>,
        public readonly ownershipSharesNFTCollection: Web3Contract<OwnershipSharesNFTCollectionAbiFunctional>,
        public readonly referralEngine: Web3Contract<ReferralsEngineAbiFunctional>,
        public readonly contractDeployer: Web3Contract<ContractDeployerAbiFunctional>,
        public readonly weth: Web3Contract<WETHAbiFunctional>,
        public readonly presaleService: Web3Contract<PresaleServiceAbiFunctional>,
        public readonly presaleServiceDeployer: Web3Contract<PresaleServiceDeployerAbiFunctional>,
    ) {
    }
}
