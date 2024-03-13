import DeploymentBase from "./base/deployment.base.js";

export default class TreasuryDeployment extends DeploymentBase {
    constructor(
        address: string,
        group: string,
        deployer: string,
        deployedOn: Date) {
        super(address, group, deployer, deployedOn);
    }
}
