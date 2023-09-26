import DeploymentBase from "./base/deployment.base";

export default class TokenDeployment extends DeploymentBase {
  constructor(
    address: string,
    group: string,
    public readonly type: number,
    public readonly tokenomics: string,
    public readonly inflation: string,
    public readonly treasury: string,
    public readonly staking?: string,
  ) {
    super(address, group);
  }
}
