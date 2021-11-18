import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';

import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  //private webUrl; // = config.api_url;

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
    //this.webUrl = this._config.getApiUrl();
  }

  downloadBackup(themeId, siteId) {
    return this._http.put(this._config.getApiUrl() + '/api/theme/backup/' + themeId, {
      site_id: siteId
    }, this._httpOptionsService.getHeader())
  }

  restoreTheme(themeId, siteId) {
    return this._http.post(this._config.getApiUrl() + '/api/theme/restore/' + themeId, {
      site_id: siteId
    }, this._httpOptionsService.getHeader())
  }

  deleteUploadFolder(themeId) {
    return this._http.delete(
      this._config.getApiUrl() + '/api/theme/install/folder/' + themeId, 
      this._httpOptionsService.getHeader()
    )
  }
  
  revertTheme(siteId, themeId, number) {
    return this._http.put(
      this._config.getApiUrl() + '/api/theme/revert/' + themeId, {
        number: number,
        site_id: siteId
      }, this._httpOptionsService.getHeader()
    )
  }

  getThemeVersions(themeId) {
    return this._http.get(
      this._config.getApiUrl() + '/api/theme/version/' + themeId, 
      this._httpOptionsService.getHeader()
    )
  }
}
