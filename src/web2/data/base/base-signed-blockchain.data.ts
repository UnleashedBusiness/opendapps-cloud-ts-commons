export class BaseSignedBlockchainData {
  constructor(
    public descriptionHash: string,
    public signature: string,
    public validUntilBlock: number,
    public signer: string,
  ) {}
}
