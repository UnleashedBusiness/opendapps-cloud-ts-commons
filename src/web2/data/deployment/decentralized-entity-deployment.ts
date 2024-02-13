import DeploymentBase from "./base/deployment.base.js";

export default class DecentralizedEntityDeployment extends DeploymentBase {
    constructor(
        address: string,
        group: string,
        deployer: string,
        deployedOn: Date,
        public readonly treasury: string,
        public readonly type: string,
        public readonly ownershipCollection?: string,
        public readonly tokenId?: number,
    ) {
        super(address, group, deployer, deployedOn);
    }
}
