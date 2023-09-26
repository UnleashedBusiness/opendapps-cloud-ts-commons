export class ProposalStateData {
  constructor(
    public targetChain: number = 0,
    public companyAddress: string = '',
    public proposalId: string = '',
    public voter: string = '',
  ) {
  }
}
