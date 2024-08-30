export class StakingStatsSeriesDto {
    constructor(
        public readonly stakingAddress: string,
        public readonly timestamp: number,
        public readonly date: string,
        public readonly epoch: string,
        public readonly height: string,
        public readonly totalShares: string,
        public readonly totalStaked: string,
        public readonly rewardTokens: StakingStatSeriesRewardTokenDto[]
    ) {
    }
}

export class StakingStatSeriesRewardTokenDto {
    constructor(
        public readonly tokenAddress: string,
        public readonly totalAvailable: string,
        public readonly lastEpochRewardsPerShare: string,
        public readonly maxPerEpoch: string,
    ) {
    }
}