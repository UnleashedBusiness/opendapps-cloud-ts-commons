export class ContractOwnerData {
  public targetChain: number;
  public wallet: string;
  public contract: string;

  constructor(targetChain: number, wallet: string, contract: string) {
    this.targetChain = targetChain;
    this.wallet = wallet;
    this.contract = contract;
  }
}
