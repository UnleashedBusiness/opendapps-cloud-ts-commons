export class ProposalData {
  constructor(
    public targetChain: number = 0,
    public companyAddress: string = "",
    public description: string = "",
    public proposalId: string = "",
    public methodCallList: MethodClass[] = [],
  ) {}
}

export class MethodClass {
  constructor(
    public target: string = "",
    public methodCallAbi: string = "",
    public methodCallAbiEncoded: string = "",
    public nativeTokenAmount: string = "0",
  ) {}
}
