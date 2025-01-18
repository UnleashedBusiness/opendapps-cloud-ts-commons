import DeploymentBase from './base/deployment.base.js';

export class LiquidityMiningDeployment extends DeploymentBase {
  public readonly token: string

  constructor(address: string, group: string, deployer: string, deploymentHeight: string, deployedOn: Date, token: string) {
    super(address, group, deployer, deploymentHeight, deployedOn);
    this.token = token;
  }
}