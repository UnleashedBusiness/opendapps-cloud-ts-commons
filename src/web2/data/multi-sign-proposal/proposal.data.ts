export class ProposalData {
  public targetChain: number = 0;
  public companyAddress: string = '';
  public description: string = '';
  public proposalId: string = '';
  public methodCallList: MethodClass[] = [];
}

export class MethodClass {
  public target: string = '';
  public methodCallAbi: string = '';
  public methodCallAbiEncoded: string = '';
  public nativeTokenAmount: string = '0';
}
