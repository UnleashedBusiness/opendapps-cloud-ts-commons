
import {
  StakingAsAServiceDeployerAbi,
  StakingAsAServiceDeployerAbiFunctional
} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BaseMultiChainContract
} from "@unleashed-business/ts-web3-commons";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { EmptyBytes32 } from "../../utils/utils.const";
import ContractToolkitService from '@unleashed-business/ts-web3-commons/dist/contract/utils/contract-toolkit.service';

export class StakingAsAServiceDeployerContract extends BaseMultiChainContract<StakingAsAServiceDeployerAbiFunctional> {
  public static readonly GROUP_STAKING = Web3.utils.soliditySha3("Staking")!;

  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected getAbi(): any {
    return StakingAsAServiceDeployerAbi;
  }

  public async deploy(contractAddress: string, tokenAddress: string, value: BigNumber, refCode?: string) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, connectedAddress) => contract.methods.deploy(
        tokenAddress,
        refCode !== undefined ? Web3.utils.sha3(refCode) : EmptyBytes32
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
