export class NftMetadata {
  constructor(
    public image = "",
    public image_data = "",
    public external_url = "",
    public description = "",
    public name = "",
    public attributes: { [index: string]: any } = {},
    public animation_url = "",
    public animation_data = "",
    public youtube_url = "",
  ) {}

  public getData(): any {
    return {
      name: this.name,
    };
  }

  public getScheme(): { [index: string]: { type: string; name: string }[] } {
    return {
      NftMetadata: [{ name: "name", type: "string" }],
    };
  }
}
