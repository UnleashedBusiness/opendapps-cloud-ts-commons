import BigNumber from "bignumber.js";
import {
  ProposalGovernorInterfaceAbi,
  ProposalGovernorInterfaceAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseMultiChainContract,
  BlockchainDefinition,
  DefaultEVMNativeTokenDecimals,
  MethodRunnable,
  NumericResult,
  ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class GovernorInterfaceContract extends BaseMultiChainContract<ProposalGovernorInterfaceAbiFunctional> {
  constructor(
    web3Connection: ReadOnlyWeb3Connection,
    transactionHelper: TransactionRunningHelperService,
  ) {
    super(web3Connection, transactionHelper);
  }

  protected getAbi(): typeof ProposalGovernorInterfaceAbi {
    return ProposalGovernorInterfaceAbi;
  }

  public execute(
    governor: string,
    targets: string[],
    values: string[],
    calldatas: string[],
    descriptionHash: string,
  ): MethodRunnable {
    const ValuesBN = values.map((x) => new BigNumber(x).multipliedBy(10 ** 18));
    let total = new BigNumber(0);
    for (const valueBN of ValuesBN) {
      total = total.plus(valueBN);
    }

    return this.buildMethodRunnableMulti(
      governor,
      async (contract, _) =>
        contract.methods.executeMethodCalls(
          targets,
          ValuesBN.map((x) => x.toString()),
          calldatas,
          descriptionHash,
        ),
      async () => {},
      async () => total,
    );
  }

  public propose(
    governor: string,
    targets: string[],
    values: BigNumber[],
    calldatas: string[],
    description: string,
  ) {
    const ValuesBN = values.map((x) => new BigNumber(x).multipliedBy(10 ** 18));
    return this.buildMethodRunnableMulti(governor, async (contract, _) =>
      contract.methods.makeProposal(
        targets,
        ValuesBN.map((x) => x.toString()),
        calldatas,
        description,
      ),
    );
  }

  public voteForProposal(governor: string, proposalId: string): MethodRunnable {
    return this.buildMethodRunnableMulti(governor, async (contract, _) =>
      contract.methods.voteForProposal(proposalId),
    );
  }

  public async requireProposal(
    config: BlockchainDefinition,
    governor: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.requireProposal(),
      batch,
      callback,
    );
  }

  public async canPropose(
    config: BlockchainDefinition,
    governor: string,
    wallet: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.canPropose(wallet),
      batch,
      callback,
    );
  }

  public async canVote(
    config: BlockchainDefinition,
    governor: string,
    wallet: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.canVote(wallet),
      batch,
      callback,
    );
  }

  public async buildProposalId(
    config: BlockchainDefinition,
    governor: string,
    targets: string[],
    values: BigNumber[],
    calldatas: string[],
    descriptionHash: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    const valuesStrings = values.map((x) =>
      new BigNumber(x).multipliedBy(DefaultEVMNativeTokenDecimals).toString(),
    );

    return this.getViewMulti(
      config,
      governor,
      async (contract) =>
        contract.methods.buildProposalId(
          targets,
          valuesStrings,
          calldatas,
          descriptionHash,
        ),
      batch,
      callback,
    );
  }

  public async proposalState(
    config: BlockchainDefinition,
    governor: string,
    proposalId: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.proposalState(proposalId),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async proposalVoteStartBlock(
    config: BlockchainDefinition,
    governor: string,
    proposalId: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.proposalVoteStartBlock(proposalId),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async proposalVoteEndBlock(
    config: BlockchainDefinition,
    governor: string,
    proposalId: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      governor,
      async (contract) => contract.methods.proposalVoteEndBlock(proposalId),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }
}