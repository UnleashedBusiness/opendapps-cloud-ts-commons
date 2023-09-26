import DeploymentBase from "./base/deployment.base";

export default class DecentralizedEntityDeployment extends DeploymentBase {
  constructor(
    address: string,
    group: string,
    public readonly treasury: string,
    public readonly type: number,
  ) {
    super(address, group);
  }
}
