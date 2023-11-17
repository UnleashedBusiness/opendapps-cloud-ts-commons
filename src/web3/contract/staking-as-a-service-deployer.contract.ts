
import {
  StakingAsAServiceDeployerAbi,
  StakingAsAServiceDeployerAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseMultiChainContract, ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import Web3 from "web3";
import BigNumber from "bignumber.js";

export class StakingAsAServiceDeployerContract extends BaseMultiChainContract<StakingAsAServiceDeployerAbiFunctional> {
  public static readonly GROUP_STAKING = Web3.utils.soliditySha3("Staking")!;

  constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
    super(web3Connection, transactionHelper);
  }

  protected getAbi(): any {
    return StakingAsAServiceDeployerAbi;
  }

  public async deploy(contractAddress: string, tokenAddress: string, value: BigNumber, refCode?: string) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, connectedAddress) => contract.methods.deploy(
        tokenAddress,
        refCode !== undefined ? Web3.utils.sha3(refCode) : '0x0'
      ),
      async () => {},
      async () => value.multipliedBy(10 ** 18)
    );
  }

  public async upgrade(contractAddress: string, stakingAddress: string) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, connectedAddress) => contract.methods.upgrade(
        stakingAddress
      )
    );
  }
}
