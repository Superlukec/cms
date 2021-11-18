import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class InstallSiteService {

  //private webUrl; // = config.api_url; 

  constructor(
    private _http: HttpClient,
    private _config: ConfigService
  ) { 
    //this.webUrl = this._config.getApiUrl();
  }

  shouldInstall() {
    return this._http.get(this._config.getApiUrl() + '/install/status');
  }

  install(
    title: string,
    domain: string,
    email: string,
    first_name: string,
    last_name: string,
    password: string
  ) {

    return this._http.post(this._config.getApiUrl() + '/install/start', {    
      title: title,
      domain: domain,
      email: email,
      first_name: first_name,
      last_name: last_name,
      password: password
    });

  }
}
