import { BaseSignedBlockchainData } from "./base-signed-blockchain.data";

export class BaseDecentralizedEntitySignedData extends BaseSignedBlockchainData {

  constructor(
    descriptionHash: string,
    signature: string,
    validUntilBlock: number,
    signer: string,
    public readonly organization: string,
  ) {
    super(descriptionHash, signature, validUntilBlock, signer);
    this.organization = organization;
  }
}
