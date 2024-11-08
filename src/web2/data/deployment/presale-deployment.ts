import DeploymentBase from "./base/deployment.base.js";

export class PresaleDeployment extends DeploymentBase {
    constructor(
        address: string,
        group: string,
        deployer: string,
        deploymentHeight: string,
        deployedOn: Date,
        public readonly type: string,
        public readonly token: string,
    ) {
        super(address, group, deployer, deploymentHeight, deployedOn);
    }
}