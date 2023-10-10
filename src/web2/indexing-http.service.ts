import {BaseHttpService} from "./base/base-http.service";

export class IndexingHttpService extends BaseHttpService {
  private static readonly ADDR_PREFIX = '/backend/indexing';
  public static readonly CURRENT_BLOCK = `${IndexingHttpService.ADDR_PREFIX}/currentBlock/{chain}`;

  public async get(chain: number): Promise<{ block: number }> {
    let path = IndexingHttpService.CURRENT_BLOCK
        .replace('{chain}', chain.toString());
    return this.GET(path);
  }
}
