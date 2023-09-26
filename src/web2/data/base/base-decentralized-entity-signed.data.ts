import {BaseSignedBlockchainData} from "./base-signed-blockchain.data";

export class BaseDecentralizedEntitySignedData extends BaseSignedBlockchainData {
  public organization: string;

  constructor(descriptionHash: string, signature: string, validUntilBlock: number, signer: string, organization: string) {
    super(descriptionHash, signature, validUntilBlock, signer);
    this.organization = organization;
  }
}
