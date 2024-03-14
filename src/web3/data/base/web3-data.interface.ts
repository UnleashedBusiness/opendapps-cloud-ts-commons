import { BlockchainDefinition } from "@unleashed-business/ts-web3-commons";
import type { BatchRequest } from '@unleashed-business/ts-web3-commons/dist/contract/utils/batch-request.js';

export interface Web3DataInterface {
  load(useCaching: boolean, config: BlockchainDefinition, web3Batch?: BatchRequest): Promise<void>;
}
