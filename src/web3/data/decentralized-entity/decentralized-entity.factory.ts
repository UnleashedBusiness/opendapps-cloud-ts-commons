import {OrganizationTypeEnum} from "../../enum/organization-type.enum";
import {MultiSignEntityData} from "./multi-sign-entity.data";
import {MultiSignSharesEntityData} from "./multi-sign-shares-entity.data";
import {SingleOwnerEntityData} from "./single-owner-entity.data";
import {BaseDecentralizedEntityData} from "./base/base-decentralized-entity.data";
import DecentralizedEntityDeployment from "../../../web2/data/deployment/decentralized-entity-deployment";
import {WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";

export class DecentralizedEntityFactory {
    static async buildIt(
        address: string,
        routerAddress: string,
        connection: WalletConnectionService,
        web3: Web3ServicesContainer,
        web2: HttpServicesContainer,
        useCache: boolean = false,
        autoLoad: boolean = true
    ): Promise<BaseDecentralizedEntityData> {
        const deployment = await web2.deployment.fetch<DecentralizedEntityDeployment>(connection.blockchain.networkId, address);

        let company: BaseDecentralizedEntityData
        switch (deployment.type) {
            case OrganizationTypeEnum.HierarchicalMultiSign.valueOf():
                company = new MultiSignEntityData(deployment, routerAddress, connection, web3, web2);
                break;
            case OrganizationTypeEnum.NFTSharesMultiSign.valueOf():
                company = new MultiSignSharesEntityData(deployment, routerAddress, connection, web3, web2);
                break;
            default:
                company = new SingleOwnerEntityData(deployment, routerAddress, connection, web3, web2);
                break;
        }
        if (autoLoad)
            await company.load(useCache);
        return company;
    }
}
