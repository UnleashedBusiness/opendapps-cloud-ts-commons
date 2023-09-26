export default abstract class DeploymentBase {
  protected constructor(
    public readonly address: string,
    public readonly group: string,
  ) {
  }
}
