export class TokenPairStatsDto {
    constructor(
        public readonly pair: string,
        public readonly timestamp: number,
        public readonly date: string,
        public readonly marketCap: string,
        public readonly priceInPair: string,
        public readonly pairedTokenPrice: string,
        public readonly price: string,
    ) {
    }
}