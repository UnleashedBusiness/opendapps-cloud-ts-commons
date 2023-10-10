import {DecentralizedEntityInterfaceContract} from "./decentralized-entity-interface.contract";
import {SingleOwnerEntityAbi} from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BlockchainDefinition, MethodRunnable, ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import {Web3BatchRequest} from "web3-core";

export class SingleOwnerEntityContract extends DecentralizedEntityInterfaceContract {
  constructor(web3Connection: ReadOnlyWeb3Connection, transactionHelper: TransactionRunningHelperService) {
    super(web3Connection, transactionHelper);
  }

  protected override getAbi(): any {
    return SingleOwnerEntityAbi;
  }

  public async ownershipTokenId(
      config: BlockchainDefinition,
      entityAddress: string,
      batch?: Web3BatchRequest,
      callback?: (result: number) => void
  ) {
    return this.getPropertyMulti(config, entityAddress, "ownershipTokenId", batch, callback);
  }

  public async ownershipCollection(
      config: BlockchainDefinition,
      entityAddress: string,
      batch?: Web3BatchRequest,
      callback?: (result: string) => void
  ) {
    return this.getPropertyMulti(config, entityAddress, "ownershipCollection", batch, callback);
  }

  public async isOwner(
      config: BlockchainDefinition,
      entityAddress: string,
      wallet: string,
      batch?: Web3BatchRequest,
      callback?: (result: boolean) => void
  ) {
    return this.getViewMulti(config, entityAddress, contract => contract.methods.isOwner(wallet), batch, callback);
  }

  public async isOperator(
      config: BlockchainDefinition,
      entityAddress: string,
      wallet: string,
      batch?: Web3BatchRequest,
      callback?: (result: boolean) => void
  ) {
    return this.getViewMulti(config, entityAddress, contract => contract.methods.isOperator(wallet), batch, callback);
  }

  public promoteOperator(company: string, address: string): MethodRunnable {
    return this.buildMethodRunnableMulti(company, (contract, _) => contract.methods.promoteOperator(address));
  }

  public demoteOperator(company: string, address: string): MethodRunnable {
    return this.buildMethodRunnableMulti(company, (contract, _) => contract.methods.demoteOperator(address));
  }
}
