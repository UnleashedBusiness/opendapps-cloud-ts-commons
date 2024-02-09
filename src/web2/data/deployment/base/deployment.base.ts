export default abstract class DeploymentBase {
  protected constructor(
    public readonly address: string,
    public readonly group: string,
    public readonly deployer: string,
    public readonly deployedOn: Date,
  ) {
  }
}
