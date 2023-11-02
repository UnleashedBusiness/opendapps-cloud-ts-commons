import { TokenAsAServiceAbi, TokenAsAServiceAbiFunctional } from "@unleashed-business/opendapps-cloud-ts-abi";
import {
  BlockchainDefinition,
  Erc20TokenContract, NumericResult,
  ReadOnlyWeb3Connection,
  TransactionRunningHelperService
} from "@unleashed-business/ts-web3-commons";
import BigNumber from "bignumber.js";
import { Web3BatchRequest } from "web3-core";

export class TokenAsAServiceContract extends Erc20TokenContract<TokenAsAServiceAbiFunctional> {
  constructor(
    web3Connection: ReadOnlyWeb3Connection,
    transactionHelper: TransactionRunningHelperService,
  ) {
    super(web3Connection, transactionHelper);
  }

  protected override getAbi(): any {
    return TokenAsAServiceAbi;
  }

  public async metadataUrl(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(
      config,
      address,
      (contract) => contract.methods.metadataUrl(),
      batch,
      callback,
    );
  }

  public async isOwnedByNFT(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: boolean) => void,
  ) {
    return this.getPropertyMulti(
      config,
      address,
      "isOwnedByNFT",
      batch,
      callback,
    );
  }

  public async tokenomics(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      address,
      "tokenomics",
      batch,
      callback,
    );
  }

  public async inflation(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(config, address, "inflation", batch, callback);
  }

  public async ownershipCollection(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: string) => void,
  ) {
    return this.getPropertyMulti(
      config,
      address,
      "ownershipCollection",
      batch,
      callback,
    );
  }

  public async ownershipTokenId(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: number) => void,
  ) {
    return this.getPropertyMulti(
      config,
      address,
      "ownershipTokenId",
      batch,
      callback !== undefined ? (result: NumericResult) => callback(this.wrap(result).toNumber()) : undefined,
    );
  }

  public async maxSupply(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewMulti(
      config,
      address,
      (contract) => contract.methods.maxSupply(),
      batch,
      async (result: NumericResult) =>
        callback
          ? callback(
              this.wrap(result).dividedBy(
                10 ** await this.decimalsDirect(config, address),
              ),
            )
          : undefined,
    );
  }

  public async initialSupply(
    config: BlockchainDefinition,
    address: string,
    batch?: Web3BatchRequest,
    callback?: (result: BigNumber) => void,
  ) {
    return this.getViewMulti(
      config,
      address,
      (contract) => contract.methods.initialSupply(),
      batch,
      async (result: NumericResult) =>
        callback
          ? callback(
              this.wrap(result).dividedBy(
                10 ** await this.decimalsDirect(config, address),
              ),
            )
          : undefined,
    );
  }
}
