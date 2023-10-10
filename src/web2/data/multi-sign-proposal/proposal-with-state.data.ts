import { MethodClass, ProposalData } from "./proposal.data";

export class ProposalWithStateData extends ProposalData {
  constructor(
    targetChain: number = 0,
    companyAddress: string = "",
    description: string = "",
    proposalId: string = "",
    methodCallList: MethodClass[] = [],
    public state: number = -1,
    public voters: string[] = [],
  ) {
    super(targetChain, companyAddress, description, proposalId, methodCallList);
  }
}
