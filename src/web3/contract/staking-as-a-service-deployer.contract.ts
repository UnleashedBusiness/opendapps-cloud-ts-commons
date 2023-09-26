
import {StakingAsAServiceDeployerAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseMultiChainContract,
  TransactionRunningHelperService,
  WalletConnectionService
} from "@unleashed-business/ts-web3-commons";
import Web3 from "web3";
import BigNumber from "bignumber.js";

export class StakingAsAServiceDeployerContract extends BaseMultiChainContract {
  public static readonly GROUP_STAKING = Web3.utils.soliditySha3("Staking")!;

  constructor(walletConnection: WalletConnectionService, transactionHelper: TransactionRunningHelperService) {
    super(walletConnection, transactionHelper);
  }

  protected getAbi(): any {
    return StakingAsAServiceDeployerAbi;
  }

  public async deploy(contractAddress: string, tokenAddress: string, value: BigNumber, refCode?: string) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, connectedAddress) => contract.methods.deploy(
        tokenAddress,
        refCode !== undefined ? Web3.utils.sha3(refCode) : '0x'
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
