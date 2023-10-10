import {ProposalWithStateData} from "./data/multi-sign-proposal/proposal-with-state.data";
import {ProposalStateData} from "./data/multi-sign-proposal/proposal-state.data";
import {BaseHttpService} from "./base/base-http.service";

export class MultiSignProposalHttpService extends BaseHttpService {
  public static readonly ADDR_PREFIX = '/backend/multiSignProposal';
  public static readonly PROPOSAL_PUSH = `${MultiSignProposalHttpService.ADDR_PREFIX}/publish`;
  public static readonly PROPOSAL_LIST = `${MultiSignProposalHttpService.ADDR_PREFIX}/list/{chain}/{company}`;
  public static readonly PROPOSAL_GET = `${MultiSignProposalHttpService.ADDR_PREFIX}/get/{chain}/{company}/{proposalId}`;

  public static readonly PROPOSAL_VOTER_PUSH = `${MultiSignProposalHttpService.ADDR_PREFIX}/vote`;
  public static readonly PROPOSAL_VOTER_LIST = `${MultiSignProposalHttpService.ADDR_PREFIX}/votes/{chain}/{company}/{proposalId}`

  public async listForCompany(chain: number, company: string, take = 10, skip = 0): Promise<ProposalWithStateData[]> {
    let path = MultiSignProposalHttpService.PROPOSAL_LIST
        .replace('{chain}', chain.toString())
        .replace('{company}', company)
      + `?take=${take}&skip=${skip}`;
    return this.GET(path);
  }

  public async listForCompanyByState(chain: number, company: string, state: number, take?: number, skip?: number): Promise<ProposalWithStateData[]> {
    let path = MultiSignProposalHttpService.PROPOSAL_LIST
        .replace('{chain}', chain.toString())
        .replace('{company}', company)
      + `?a=a&state=${state}`;
    if (take !== undefined)
      path += `&take=${take}`;
    if (skip !== undefined)
      path += `&skip=${skip}`;
    return this.GET(path);
  }

  public async getProposal(chain: number, company: string, proposalId: string): Promise<ProposalWithStateData> {
    let path = MultiSignProposalHttpService.PROPOSAL_GET
      .replace('{chain}', chain.toString())
      .replace('{company}', company)
      .replace('{proposalId}', proposalId);
    return this.GET(path);
  }

  public async listVotersForProposal(chain: number, company: string, proposalId: string, take = 10, skip = 0): Promise<ProposalStateData[]> {
    let path = MultiSignProposalHttpService.PROPOSAL_VOTER_LIST
        .replace('{chain}', chain.toString())
        .replace('{company}', company)
        .replace('{proposalId}', proposalId)
      + `?take=${take}&skip=${skip}`;
    return this.GET(path);
  }
}
