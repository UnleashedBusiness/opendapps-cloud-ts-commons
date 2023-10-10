export class DecentralizedEntityMembershipData {
  constructor(
    public targetChain: number,
    public wallet: string,
    public organization: string,
  ) {}
}
