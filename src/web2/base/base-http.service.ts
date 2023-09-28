import {HttpServiceConfig} from "../config/http-service.config";
import axios from 'axios';

export class BaseHttpService {
    public constructor(protected config: HttpServiceConfig) {
    }

    protected async POST<T>(relativeURL: string, data: any = null): Promise<T> {
        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const absoluteURL = this.getAbsoluteUrl(relativeURL);
        const response = await axios.post<T>(absoluteURL, data, httpOptions);
        return response.data;
    }

    protected async PUT<T>(relativeURL: string, data: any = null): Promise<T> {
        const httpOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const absoluteURL = this.getAbsoluteUrl(relativeURL);
        const response = await axios.put<T>(absoluteURL, data, httpOptions);
        return response.data;
    }

    protected async GET<T>(relativeURL: string, headers?: { [index: string]: string }): Promise<T> {
        const httpOptions = {
            headers: headers !== undefined
                ? {...headers, ...{'Content-Type': 'application/json'}}
                : {'Content-Type': 'application/json'}
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
        return this.config.backendUrl[this.config.backendUrl.length - 1] === '/'
            ? this.config.backendUrl.substring(-1)
            : this.config.backendUrl
            + "/" +
            relativeUrl[0] === '/'
                ? relativeUrl.substring(1)
                : relativeUrl;
    }
}
