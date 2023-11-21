import {
  BaselineInsuranceServiceDeployerAbi,
  BaselineInsuranceServiceDeployerAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseTokenAwareContract,
  ContractToolkitService,
  Erc20TokenContract
} from "@unleashed-business/ts-web3-commons";
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { EmptyBytes32 } from '../../utils/utils.const';

export class BaselineInsuranceDeployerContract extends BaseTokenAwareContract<BaselineInsuranceServiceDeployerAbiFunctional> {
  public static readonly GROUP_ASSET_BACKING = Web3.utils.soliditySha3('AseetBacking')!;
  public static readonly GROUP_ASSET_BACKING_SWAP_MODEL = Web3.utils.soliditySha3('AseetBackingSwapModel')!;

  constructor(token: Erc20TokenContract, toolkit: ContractToolkitService) {
    super(token, toolkit);
  }

  protected getAbi(): any {
    return BaselineInsuranceServiceDeployerAbi;
  }

  public async deploySimpleModel(
    contractAddress: string,
    tokenAddress: string,
    backingToken: string,
    value: BigNumber,
    refCode?: string,
  ) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, _) =>
        contract.methods.deploySimpleModel(
          tokenAddress,
          backingToken,
          refCode !== undefined ? Web3.utils.sha3(refCode) : EmptyBytes32,
        ),
      async () => {},
      async () => value.multipliedBy(10 ** 18),
    );
  }

  public async deployTanXModel(
    contractAddress: string,
    tokenAddress: string,
    backingToken: string,
    value: BigNumber,
    refCode?: string,
  ) {
    return this.buildMethodRunnableMulti(
      contractAddress,
      (contract, _) =>
        contract.methods.deployTanXModel(
          tokenAddress,
          backingToken,
          refCode !== undefined ? Web3.utils.sha3(refCode) : EmptyBytes32,
        ),
      async () => {},
      async () => value.multipliedBy(10 ** 18),
    );
  }
}
