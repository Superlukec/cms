import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {

  //private webUrl; // = config.api_url;

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
    //this.webUrl = this._config.getApiUrl();
  }

  getSites() {
    return this._http.get(this._config.getApiUrl() + '/api/management/sites', this._httpOptionsService.getHeader())
  }

  addSite(title: string, domain: string, configuration: boolean) {
    return this._http.post(this._config.getApiUrl() + '/api/management/site', { 
      title: title,
      domain: domain,
      configuration: configuration
    }, this._httpOptionsService.getHeader())
  }

  deleteSite(siteId: string) {
    return this._http.delete(this._config.getApiUrl() + '/api/management/' + siteId, this._httpOptionsService.getHeader())
  }

}
