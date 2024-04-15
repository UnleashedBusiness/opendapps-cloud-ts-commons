export class TokenStatsDto {
    constructor(
        public readonly token: string,
        public readonly timestamp: number,
        public readonly date: string,
        public readonly burnt: string,
        public readonly maxSupply: string,
        public readonly totalSupply: string,
        public readonly circulatingSupply: string,
        public readonly holders: number
    ) {
    }
}