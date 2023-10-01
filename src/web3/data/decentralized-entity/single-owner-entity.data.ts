import {BaseDecentralizedEntityData} from "./base/base-decentralized-entity.data";
import Web3 from "web3";
import {EmptyAddress, WalletConnectionService} from "@unleashed-business/ts-web3-commons";
import DecentralizedEntityDeployment from "../../../web2/data/deployment/decentralized-entity-deployment";
import {Web3ServicesContainer} from "../../../web3-services.container";
import {HttpServicesContainer} from "../../../http-services.container";
import {Web3BatchRequest} from "web3-core";

export class SingleOwnerEntityData extends BaseDecentralizedEntityData {
    private _owner: string = EmptyAddress;

    public override get connectedWalletRoles(): string[] {
        const roles = [];
        if (Web3.utils.toChecksumAddress(this._owner) === Web3.utils.toChecksumAddress(this.connection.accounts[0])) {
            roles.push("Owner");
        }
        return roles;
    }

    public override get teamMembersText(): string {
        return "1 Owner";
    }

    public override get votingProposals(): string[] {
        return [];
    }

    public get owner(): string {
        return this._owner;
    }

    constructor(
        deployment: DecentralizedEntityDeployment,
        routerAddress: string,
        connection: WalletConnectionService,
        web3Services: Web3ServicesContainer,
        web2: HttpServicesContainer
    ) {
        super(deployment, routerAddress, connection, web3Services, web2);
    }

    async loadTypeSpecifics(useCaching: boolean, web3Batch?: Web3BatchRequest): Promise<void> {
        const web3Config = this.connection.blockchain;

        await this.web3Services
            .singleOwnerEntity
            .owner(
                web3Config, this.address, web3Batch,
                result => {
                    this._owner = result
                });
    }
}
