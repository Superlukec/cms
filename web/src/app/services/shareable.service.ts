import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class ShareableService {

  //private webUrl; // = config.api_url;

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
    //this.webUrl = this._config.getApiUrl();
  }

  getShareables(siteId) {
    return this._http.get(this._config.getApiUrl() + '/api/shareables/' + siteId, this._httpOptionsService.getHeader())
  }

  getShareable(siteId, shareableId) {
    return this._http.get(this._config.getApiUrl() + '/api/shareables/' + siteId + '/' + shareableId, this._httpOptionsService.getHeader())
  }

  downloadFile(siteId, shareableId, fileId) {
    return this._http.get(this._config.getApiUrl() + '/api/shareables/prepare/' + siteId + '/' + shareableId + '/' + fileId, this._httpOptionsService.getHeader())
  }

  downloadZip(siteId, shareableId) {
    return this._http.get(this._config.getApiUrl() + '/api/shareables/zip/' + siteId + '/' + shareableId, this._httpOptionsService.getHeader())
  }
}
