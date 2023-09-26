import {Web3BatchRequest} from 'web3-core';

export interface Web3DataInterface {
  load(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void>;
}
