import DeploymentBase from "./base/deployment.base.js";

export default class TokenDeployment extends DeploymentBase {
  constructor(
    address: string,
    group: string,
    deployer: string,
    deploymentHeight: string,
    deployedOn: Date,
    public readonly type: string,
    public readonly tokenomics: string,
    public readonly inflation: string,
    public readonly treasury: string,
    public readonly staking?: string,
    public readonly assetBacking?: string,
  ) {
    super(address, group, deployer, deploymentHeight, deployedOn);
  }
}
