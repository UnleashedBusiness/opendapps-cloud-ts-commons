import axios from "axios";
import UrlUtils from "../../utils/url-utils";

export abstract class BaseHttpService {
  public constructor(protected readonly baseUrl: string) {}

  protected async POST<T>(relativeURL: string, data: any = null): Promise<T> {
    const httpOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const absoluteURL = this.getAbsoluteUrl(relativeURL);
    const response = await axios.post<T>(absoluteURL, data, httpOptions);
    return response.data;
  }

  protected async PUT<T>(relativeURL: string, data: any = null): Promise<T> {
    const httpOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const absoluteURL = this.getAbsoluteUrl(relativeURL);
    const response = await axios.put<T>(absoluteURL, data, httpOptions);
    return response.data;
  }

  protected async GET<T>(
    relativeURL: string,
    headers?: { [index: string]: string },
  ): Promise<T> {
    const httpOptions = {
      headers:
        headers !== undefined
          ? { ...headers, ...{ "Content-Type": "application/json" } }
          : { "Content-Type": "application/json" },
    };
    const absoluteURL = this.getAbsoluteUrl(relativeURL);

    const response = await axios.get<T>(absoluteURL, httpOptions);
    return response.data;
  }

  protected async DELETE<T>(relativeURL: string): Promise<T> {
    const absoluteURL = this.getAbsoluteUrl(relativeURL);

    const response = await axios.delete<T>(absoluteURL);
    return response.data;
  }

  protected getAbsoluteUrl(relativeUrl: string): string {
    return UrlUtils.getAbsoluteUrl(this.baseUrl, relativeUrl);
  }
}
