import type {Web3ServicesContainer} from "../../../web3-services.container.js";
import type {HttpServicesContainer} from "../../../http-services.container.js";
import type {ReadOnlyWeb3Connection} from "@unleashed-business/ts-web3-commons";

export interface LoaderServiceProviderInterface {
    get web3Services(): Web3ServicesContainer;
    get httpServices(): HttpServicesContainer;
    get connection(): ReadOnlyWeb3Connection;
}
