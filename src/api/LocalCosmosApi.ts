import type { FrontendSettings } from '../types/Settings';
import type {
  TokenObtainPairSerializerWithClientID,
  LocalcosmosUser,
  Registration
} from './Authentication';
import type { CropParameters } from './ProfilePicture';

import type { GenericForm } from '../features/GenericForm';
import type { Dataset, DatasetCreateRequest, DatasetFilterRequest, Operators } from './Dataset';
import type { ObservationFormCreateRequest } from './ObservationForm';
import type { ContactUserReqest } from './ContactUser';

import type { CreateLogEntryRequest } from '../types/Analytics';

export enum LCApiResultTypes {
  error = 'error',
  success = 'success',
}
enum ContentTypes {
  json = 'application/json',
  FormData = 'multipart/form-data',
}

export type ServerErrorTypes = string | string[] | object;

export interface LCApiRequestResult {
  type: LCApiResultTypes,
  response: Response,
  data: any,
  error: ServerErrorTypes,
};

export class LocalCosmosApi {

  settings: FrontendSettings
  apiUrl: string;

  constructor(settings: FrontendSettings) {
    this.settings = settings;
    this.apiUrl = settings.API_URL;
  }

  private addAuthorizationHeader(headers: Headers, token: string): Headers {
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private getHeaders(contentType?: string): Headers {
    let headers = new Headers();
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    return headers;
  }

  private getAuthedHeaders(token: string, contentType?: string): Headers {
    let headers = this.getHeaders(contentType);
    headers = this.addAuthorizationHeader(headers, token);
    return headers;
  }

  private getUrl(endpoint: string): string {
    return `${this.apiUrl}${this.settings.APP_UUID}${endpoint}`;
  }

  async login(user: TokenObtainPairSerializerWithClientID): Promise<LCApiRequestResult> {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': ContentTypes.json,
      },
      body: JSON.stringify(user)
    };

    const url = this.getUrl('/token/');

    return await this.performFetch(url, options);

  }

  async refreshToken(refreshToken: string): Promise<LCApiRequestResult> {
    const body = {
      refresh: refreshToken
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': ContentTypes.json,
      },
      body: JSON.stringify(body),
    };

    const url = this.getUrl('/token/refresh/');

    return await this.performFetch(url, options);
  }

  async blacklistToken(token: string): Promise<LCApiRequestResult> {
    const body = {
      refresh: token
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': ContentTypes.json,
      },
      body: JSON.stringify(body),
    };

    const url = this.getUrl('/token/blacklist/');

    return await this.performFetch(url, options);
  }

  async registerAccount(data: Registration) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': ContentTypes.json
      },
      body: JSON.stringify(data),
    };

    const url = this.getUrl('/user/register/');

    return await this.performFetch(url, options);
  }

  async updateAccount(token: string, data: LocalcosmosUser) {
    const options = {
      headers: this.getAuthedHeaders(token, ContentTypes.json),
      method: 'PUT',
      body: JSON.stringify(data),
    };

    const url = this.getUrl('/user/');

    return await this.performFetch(url, options);
  }

  async deleteAccount(token: string) {
    const options = {
      headers: this.getAuthedHeaders(token, ContentTypes.json),
      method: 'DELETE',
    };

    const url = this.getUrl('/user/');

    return await this.performFetch(url, options);
  }

  async getUser(token: string) {
    const options = {
      method: 'GET',
      headers: this.getAuthedHeaders(token),
    };

    const url = this.getUrl('/user/');

    return await this.performFetch(url, options);
  }

  /** 
   * Profile Picture
   */

  async getProfilePicture(userId: string): Promise<LCApiRequestResult> {
    const url = this.getUrl(`/content-image/LocalcosmosUser/${userId}/profilepicture/`);

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': ContentTypes.json,
      },
    };

    return await this.performFetch(url, options);

  }

  async uploadProfilePicture(userId: string, token: string, imageFilename: string, image: Blob, cropParameters?: CropParameters) {
    const formData = new FormData();
    formData.append('sourceImage', image, imageFilename);

    if (cropParameters) {
      formData.append('cropParameters', cropParameters);
    }

    let headers = new Headers();
    headers = this.addAuthorizationHeader(headers, token);

    const options = {
      method: 'POST',
      headers: headers,
      body: formData,
    };

    const url = this.getUrl(`/content-image/LocalcosmosUser/${userId}/profilepicture/`);

    return await this.performFetch(url, options);
  }

  async deleteProfilePicture(userId: string, token: string): Promise<LCApiRequestResult> {

    const result = await this.getProfilePicture(userId);

    if (result.type === LCApiResultTypes.success) {

      const image = result.data;

      if (image) {
        const imageId = image.id;

        const options = {
          headers: this.getAuthedHeaders(token),
          method: 'DELETE',
        };

        const url = this.getUrl(`/content-image/${imageId}/`);

        return await this.performFetch(url, options);
      }

    }

    return result;

  }

  async resetPasswordEmail(email: string): Promise<LCApiRequestResult> {

    const data = {
      'email': email
    };

    const options = {
      method: 'POST',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(data)
    };

    const url = this.getUrl(`/password/reset/`);

    return this.performFetch(url, options);

  }

  async performFetch(url: string, options: any) {
    let response = null;
    let status = null;
    let error = null;
    let responseData = null;
    let resultType = LCApiResultTypes.error;

    try {
      response = await fetch(url, options);
      status = response.status;

      let data = {}

      if (status != 204) {
        data = await response.json();
      }

      if (response?.ok) {
        responseData = data;
        resultType = LCApiResultTypes.success;
      } else {
        console.log(data);
        error = data || response.status;
        console.log(error);
      }
    }
    catch (e) {
      console.log(e);
      error = `Network error: ${status}`;
    }

    const result = {
      type: resultType,
      response: response,
      data: responseData,
      error: error,
    } as LCApiRequestResult;

    console.log(result)

    return result;
  }

  /**
   * OBSERVATION FORM API
   */

  async getObservationForm(uuid: string, version: string): Promise<LCApiRequestResult> {
    const options = {
      method: 'GET',
    };

    const url = this.getUrl(`/observation-form/${uuid}/${version}/`);

    return this.performFetch(url, options);
  }

  async postObservationForm(genericForm: GenericForm, token?: string): Promise<LCApiRequestResult> {

    const body: ObservationFormCreateRequest = {
      uuid: genericForm.uuid,
      version: genericForm.version,
      definition: genericForm,
    };

    const options = {
      method: 'POST',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body)
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }

    const url = this.getUrl(`/observation-form/`);

    return this.performFetch(url, options);

  }

  /**
   * DATASETS API
   */
  async createDataset(data: Record<string, any>, genericForm: GenericForm, clientId: string, platform: string, token?: string): Promise<LCApiRequestResult> {

    const body: DatasetCreateRequest = {
      data: data,
      platform: platform,
      clientId: clientId,
      observationForm: {
        uuid: genericForm.uuid,
        version: genericForm.version,
      },
    };

    const options = {
      method: 'POST',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body)
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }

    const url = this.getUrl(`/dataset/`);

    return this.performFetch(url, options);
  }

  async updateDataset(datasetUuid: string, data: Record<string, any>, genericForm: GenericForm, clientId: string, platform: string, token?: string): Promise<LCApiRequestResult> {
    const body: DatasetCreateRequest = {
      data: data,
      platform: platform,
      clientId: clientId,
      observationForm: {
        uuid: genericForm.uuid,
        version: genericForm.version,
      },
    };

    const options = {
      method: 'PUT',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body)
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }

    const url = this.getUrl(`/dataset/${datasetUuid}/`);

    return this.performFetch(url, options);
  }

  async getUserDatasetList(clientId: string, token?: string, limit?: number, offset?: number): Promise<LCApiRequestResult> {

    let url = this.getUrl(`/dataset/`);
    let options = {
      method: 'GET',
      headers: {}
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }
    else {
      url = `${url}?client_id=${clientId}`;
    }

    if (limit){
      let connector = '?';
      if (url.indexOf('?') >=0 ) {
        connector = '&';
      }
      url = `${url}${connector}limit=${limit}`;
    }

    if (offset) {
      let connector = '?';
      if (url.indexOf('?') >=0 ) {
        connector = '&';
      }
      url = `${url}${connector}offset=${offset}`;
    }

    return this.performFetch(url, options);
  }

  async getDataset(uuid: string): Promise<LCApiRequestResult> {

    const options = {
      method: 'GET',
      headers: this.getHeaders(ContentTypes.json),
    };

    const url = this.getUrl(`/dataset/${uuid}/`);

    return this.performFetch(url, options);

  }

  async getDatasets(limit?: number, offset?: number): Promise<LCApiRequestResult> {

    const options = {
      method: 'GET',
      headers: this.getHeaders(ContentTypes.json),
    };

    let url = this.getUrl(`/dataset/`);

    if (limit){
      url = `${url}?limit=${limit}`;
    }

    if (offset) {
      if (limit) {
        url = `${url}&offset=${offset}`;
      } else {
        url = `${url}?offset=${offset}`;
      }
    }

    return this.performFetch(url, options);
  }

  async getFilteredDatasets(filters: DatasetFilterRequest, limit?: number, offset?: number): Promise<LCApiRequestResult> {

    const options = {
      method: 'POST',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(filters),
    };

    let url = this.getUrl(`/datasets/`);

    if (limit){
      url = `${url}?limit=${limit}`;
    }

    if (offset) {
      if (limit) {
        url = `${url}&offset=${offset}`;
      } else {
        url = `${url}?offset=${offset}`;
      }
    }

    return this.performFetch(url, options);

  }

  async deleteDataset(datasetUuid: string, clientId:string, token?: string): Promise<LCApiRequestResult> {

    const body = {
      clientId: clientId,
    }

    const options = {
      method: 'DELETE',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body)
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }

    const url = this.getUrl(`/dataset/${datasetUuid}/`);

    return this.performFetch(url, options);
  }

  async createDatasetImage(datasetUuid: string, fieldUuid:string, image: File|Blob, fileName: string, token?: string): Promise<LCApiRequestResult> {

    const formData = new FormData();
    formData.append('image', image, fileName);
    formData.append('fieldUuid', fieldUuid);

    const url = this.getUrl(`/dataset/${datasetUuid}/image/`);

    let headers = new Headers();

    if (token) {
      headers = this.addAuthorizationHeader(headers, token);
    }

    const options = {
      method: 'POST',
      headers: headers,
      body: formData
    };

    return this.performFetch(url, options);

  }

  async deleteDatasetImage(datasetUuid:string, imageId: number, clientId: string, token?: string): Promise<LCApiRequestResult> {

    const body = {
      clientId: clientId
    };
    
    const options = {
      method: 'DELETE',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body),
    };

    if (token) {
      options.headers = this.getAuthedHeaders(token, ContentTypes.json);
    }
    
    const url = this.getUrl(`/dataset/${datasetUuid}/image/${imageId}/`);

    return this.performFetch(url, options);
  }

  /** analytics */
  async createLogEntry(eventType: string, eventContent?:string, platform?:string, appVersion?:string): Promise<LCApiRequestResult> {
    const body: CreateLogEntryRequest = {
      eventType: eventType,
    };

    if (eventContent) {
      body.eventContent = eventContent;
    }
    if (platform) {
      body.platform = platform;
    }
    if (appVersion) {
      body.appVersion = appVersion;
    }

    const options = {
      method: 'POST',
      headers: this.getHeaders(ContentTypes.json),
      body: JSON.stringify(body),
    };

    const url = this.getUrl(`/anonymous-log-entry/`);

    return this.performFetch(url, options);

  }

  async getEventCount(eventType: string, eventContent?:string): Promise<LCApiRequestResult> {
    let url = this.getUrl(`/anonymous-log/get-event-count/`);
    url = `${url}?event-type=${eventType}`;
    if (eventContent) {
      url = `${url}&event-content=${eventContent}`;
    }

    const options = {
      method: 'GET',
      headers: this.getHeaders(ContentTypes.json),
    };

    return this.performFetch(url, options);
  }

  /** public user */
  async getUserProfile(uuid: string): Promise<LCApiRequestResult> {
    const options = {
      method: 'GET',
      headers: this.getHeaders(ContentTypes.json),
    };

    const url = this.getUrl(`/user-profile/${uuid}/`);

    return this.performFetch(url, options);
  }

  async sendUserMessage(uuid:string, subject:string, message:string, token: string): Promise<LCApiRequestResult> {

    const headers = this.getAuthedHeaders(token, ContentTypes.json);

    const body:ContactUserReqest = {
      "subject": subject,
      "message": message
    };

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    };

    const url = this.getUrl(`/contact-user/${uuid}/`);

    return this.performFetch(url, options);
  }

  /** template content */
  //async getTemplateContent (): Promise<LCApiRequestResult> {

  //}

  //async getTemplateContentPreview (): Promise<LCApiRequestResult> {

  //}
}