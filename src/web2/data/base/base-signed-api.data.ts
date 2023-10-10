import Web3 from "web3";

export class BaseSignedApiData {
  constructor(
    public signer: string = "",
    public timestamp: number = new Date().valueOf(),
    public signature: string = "",
  ) {}

  public getData(): any {
    return {
      signer: Web3.utils.toChecksumAddress(this.signer),
      timestamp: this.timestamp,
    };
  }

  public getScheme(): { [index: string]: { type: string; name: string }[] } {
    return {
      BaseSignedDataForApiValidation: [
        { name: "signer", type: "address" },
        { name: "timestamp", type: "uint256" },
      ],
    };
  }
}
