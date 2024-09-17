import type {BlockchainDefinition} from "@unleashed-business/ts-web3-commons";

export interface ODAInfraContractRouterInterface {
    get proxyAdmin(): Promise<string>;
    get referralsEngine(): Promise<string>;
    get contractDeployer(): Promise<string>;
    get tokenAsAServiceDeployer(): Promise<string>;
    get decentralizedEntityDeployer(): Promise<string>;
    get stakingAsAServiceDeployer(): Promise<string>;
    get assetBackingDeployer(): Promise<string>;
    get presaleDeployer(): Promise<string>;
    get treasuryDeployer(): Promise<string>;
    get vestingDeployer(): Promise<string>;
    get distributorDeployer(): Promise<string>;
}

export interface ODAInfraContractRouterBuilderInterface {
    build(config: BlockchainDefinition): ODAInfraContractRouterInterface;
}