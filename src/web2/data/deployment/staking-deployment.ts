import DeploymentBase from "./base/deployment.base.js";

export default class StakingDeployment extends DeploymentBase {
    constructor(
        address: string,
        group: string,
        deployer: string,
        deploymentHeight: string,
        deployedOn: Date,
        public readonly token: string) {
        super(address, group, deployer, deploymentHeight, deployedOn);
    }
}
