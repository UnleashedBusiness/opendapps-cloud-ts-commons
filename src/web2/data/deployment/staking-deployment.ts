import DeploymentBase from "./base/deployment.base";

export default class StakingDeployment extends DeploymentBase {
    constructor(
        address: string,
        group: string,
        deployer: string,
        deployedOn: Date,
        public readonly token: string) {
        super(address, group, deployer, deployedOn);
    }
}
