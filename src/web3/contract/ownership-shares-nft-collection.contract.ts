import {
  OwnershipSharesNFTCollectionAbi,
  OwnershipSharesNFTCollectionAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import {
  BaseMultiChainContract,
  BlockchainDefinition,
  MethodRunnable,
  NumericResult,
  ReadOnlyWeb3Connection,
  TransactionRunningHelperService,
} from '@unleashed-business/ts-web3-commons';
import { Web3BatchRequest } from 'web3-core';

export class OwnershipSharesNftCollectionContract extends BaseMultiChainContract<OwnershipSharesNFTCollectionAbiFunctional> {
  constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
    super(web3Connection, transactionHelper);
  }

  protected override getAbi(): any {
    return OwnershipSharesNFTCollectionAbi;
  }

  public async contractURI(
    config: BlockchainDefinition,
    contract: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(config, contract, (contract1) => contract1.methods.contractURI(), batch, callback);
  }

  public async totalShares(
    config: BlockchainDefinition,
    contract: string,
    tokenId: number,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      contract,
      (contract1) => contract1.methods.totalSupply(tokenId),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async balanceOf(
    config: BlockchainDefinition,
    contract: string,
    account: string,
    tokenId: number,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getViewMulti(
      config,
      contract,
      (contract1) => contract1.methods.balanceOf(account, tokenId),
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public safeTransferFrom(
    organization: string,
    from: string,
    to: string,
    token: number,
    amount: number,
  ): MethodRunnable {
    return this.buildMethodRunnableMulti(organization, (contract, connectedAddress) =>
      contract.methods.safeTransferFrom(from, to, token, amount, []),
    );
  }
}
