import {ProposalData} from "./proposal.data";

export class ProposalWithStateData extends ProposalData {
  public state: number = -1;
  public voters: string[] = [];
}
