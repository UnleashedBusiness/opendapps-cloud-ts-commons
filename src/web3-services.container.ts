import {DecentralizedEntityDeployerContract} from "./web3/contract/decentralized-entity-deployer.contract";
import {TokenAsAServiceDeployerContract} from "./web3/contract/token-as-a-service-deployer.contract";
import {StakingAsAServiceDeployerContract} from "./web3/contract/staking-as-a-service-deployer.contract";
import {DecentralizedEntityInterfaceContract} from "./web3/contract/decentralized-entity-interface.contract";
import {GovernorInterfaceContract} from "./web3/contract/governor-interface.contract";
import {SingleOwnerEntityContract} from "./web3/contract/single-owner-entity.contract";
import {MultiSignEntityContract} from "./web3/contract/multi-sign-entity-contract";
import {MultiSignSharesEntityContract} from "./web3/contract/multi-sign-shares-entity.contract";
import {
  Erc20TokenContract,
  UniswapFactoryContract,
  UniswapPairContract,
  UniswapRouterContract, WethContract
} from "@unleashed-business/ts-web3-commons";
import {TokenAsAServiceContract} from "./web3/contract/token-as-a-service.contract";
import {StakingAsAServiceContract} from "./web3/contract/staking-as-a-service.contract";
import {DymanicTokenomicsContractService} from "./web3/contract/dynamic-tokenomics.contract";
import {InflationContract} from "./web3/contract/inflation-contract";
import {TokenLiquidityTreasuryContract} from "./web3/contract/token-liquidity-treasury.contract";
import {TokenRewardsTreasuryContract} from "./web3/contract/token-rewards-treasury.contract";
import {OwnershipNftCollectionContract} from "./web3/contract/ownership-nft-collection.contract";
import {OwnershipSharesNftCollectionContract} from "./web3/contract/ownership-shares-nft-collection.contract";
import {ReferralEngineContract} from "./web3/contract/referral-engine.contract";
import {ContractDeployerContract} from "./web3/contract/contract-deployer.contract";
import {OpenDAppsCloudRouterContract} from "./web3/contract/opendapps-cloud-router.contract";

export class Web3ServicesContainer {
  constructor(
    public readonly openDAppsCloudRouter: OpenDAppsCloudRouterContract,
    public readonly decentralizedEntityDeployer: DecentralizedEntityDeployerContract,
    public readonly tokenAsAServiceDeployer: TokenAsAServiceDeployerContract,
    public readonly stakingAsAServiceDeployer: StakingAsAServiceDeployerContract,
    public readonly decentralizedEntityInterface: DecentralizedEntityInterfaceContract,
    public readonly governorInterface: GovernorInterfaceContract,
    public readonly singleOwnerEntity: SingleOwnerEntityContract,
    public readonly multiSignEntity: MultiSignEntityContract,
    public readonly multiSignSharesEntity: MultiSignSharesEntityContract,
    public readonly token: Erc20TokenContract,
    public readonly tokenAsAService: TokenAsAServiceContract,
    public readonly stakingAsAService: StakingAsAServiceContract,
    public readonly dymanicTokenomics: DymanicTokenomicsContractService,
    public readonly inflation: InflationContract,
    public readonly tokenLiquidityTreasury: TokenLiquidityTreasuryContract,
    public readonly tokenRewardsTreasury: TokenRewardsTreasuryContract,
    public readonly uniswapRouter: UniswapRouterContract,
    public readonly uniswapPair: UniswapPairContract,
    public readonly uniswapFactory: UniswapFactoryContract,
    public readonly ownershipNFTCollection: OwnershipNftCollectionContract,
    public readonly ownershipSharesNFTCollection: OwnershipSharesNftCollectionContract,
    public readonly referralEngine: ReferralEngineContract,
    public readonly contractDeployer: ContractDeployerContract,
    public readonly weth: WethContract,
  ) {}
}
