export class BaseSignedBlockchainData {
  public descriptionHash: string;
  public signature: string;
  public validUntilBlock: number;
  public signer: string;

  constructor(descriptionHash: string, signature: string, validUntilBlock: number, signer: string) {
    this.descriptionHash = descriptionHash;
    this.signature = signature;
    this.validUntilBlock = validUntilBlock;
    this.signer = signer;
  }
}
