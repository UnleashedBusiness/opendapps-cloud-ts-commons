import { BaseSignedApiData } from "../base/base-signed-api.data.js";
import { NftMetadata } from "../base/nft/nft-metadata.js";
import Web3 from "web3";

export class OwnershipNftMetadataDeployData extends BaseSignedApiData {
  constructor(
    signer: string = "",
    timestamp: number = new Date().valueOf(),
    signature: string = "",
    public metadata: NftMetadata = new NftMetadata(),
    public targetChain: number = 0,
    public erc1155 = "",
  ) {
    super(signer, timestamp, signature);
  }

  override getData(): any {
    return {
      ...super.getData(),
      metadata: this.metadata.getData(),
      targetChain: this.targetChain,
      erc1155: Web3.utils.toChecksumAddress(this.erc1155),
    };
  }

  override getScheme(): { [index: string]: { type: string; name: string }[] } {
    return {
      OwnershipNFTMetadata: [
        ...super.getScheme()["BaseSignedDataForApiValidation"],
        { name: "metadata", type: "NftMetadata" },
        { name: "targetChain", type: "uint256" },
        { name: "erc1155", type: "address" },
      ],
      ...this.metadata.getScheme(),
    };
  }
}
