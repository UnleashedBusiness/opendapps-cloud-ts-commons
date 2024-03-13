export class StakingStatsDto {
    public contractAddress: string;
    public chainId: number;
    public totalValueLocked: string;
    public vaultsCreated: number;
    public vaultsSealed: number;
    public lastHeight: string;


    constructor(contractAddress: string, chainId: number, totalValueLocked: string, vaultsCreated: number, vaultsSealed: number, lastHeight: string) {
        this.contractAddress = contractAddress;
        this.chainId = chainId;
        this.totalValueLocked = totalValueLocked;
        this.vaultsCreated = vaultsCreated;
        this.vaultsSealed = vaultsSealed;
        this.lastHeight = lastHeight;
    }
}