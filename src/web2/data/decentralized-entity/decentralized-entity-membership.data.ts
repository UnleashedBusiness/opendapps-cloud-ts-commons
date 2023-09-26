export class DecentralizedEntityMembershipData {
  public targetChain: number;
  public wallet: string;
  public organization: string;

  constructor(targetChain: number, wallet: string, organization: string) {
    this.targetChain = targetChain;
    this.wallet = wallet;
    this.organization = organization;
  }
}
