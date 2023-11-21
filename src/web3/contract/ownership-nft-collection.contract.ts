import {
  OwnershipNFTCollectionAbi,
  OwnershipNFTCollectionAbiFunctional,
} from '@unleashed-business/opendapps-cloud-ts-abi';
import { BlockchainDefinition, ContractToolkitService, Erc721Contract } from '@unleashed-business/ts-web3-commons';

export class OwnershipNftCollectionContract extends Erc721Contract<OwnershipNFTCollectionAbiFunctional> {
  constructor(toolkit: ContractToolkitService) {
    super(toolkit);
  }

  protected override getAbi(): any {
    return OwnershipNFTCollectionAbi;
  }

  public async tokenURI(
    config: BlockchainDefinition,
    contract: string,
    tokenId: number,
    batch?: any,
    callback?: (result: string) => void,
  ) {
    return this.getViewMulti(config, contract, (contract1) => contract1.methods.tokenURI(tokenId), batch, callback);
  }
}
