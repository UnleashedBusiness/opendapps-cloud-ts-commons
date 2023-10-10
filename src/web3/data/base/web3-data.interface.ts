import {Web3BatchRequest} from 'web3-core';
import { BlockchainDefinition } from "@unleashed-business/ts-web3-commons";

export interface Web3DataInterface {
  load(useCaching: boolean, config: BlockchainDefinition, web3Batch?: Web3BatchRequest): Promise<void>;
}
