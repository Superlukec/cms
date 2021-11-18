import { Injectable, PLATFORM_ID, Optional, Inject, Injector } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { REQUEST } from '@nguniversal/express-engine/tokens';

import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config : any = {
    development: config.development,
    api_url: config.api_url
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: any,
    private _http: HttpClient
  ) { }

  getConfig() {
    return this.config;
  }

  isDevelopment() {
    return this.config.development; 
  }

  getApiUrl() {
    return this.config.api_url;
  }

  getConfigSettings() {
    console.log('Get config settings')

    return new Promise((resolve, reject) => {

      if(this.config.development) {
        return resolve(true);
      }
      else {

        let req = this.request; 
        let pathToSettings = 'assets/settings.json?v=' + Date.now();

        if (isPlatformServer(this.platformId)) {

          // When using angular universal, URL must be absolute
          pathToSettings = req.protocol + '://' + req.get('host') + '/' + pathToSettings; 

        }

        this._http.get(pathToSettings).subscribe((data: any) =>{
          
          this.config.api_url = data.api;

          // wait a little bit, so that the service is updated
          setTimeout(() => {
            return resolve(true);
          }, 300);
          
        }, err => {

          if (err.status != 200) {
            return reject(404);
          }

        });

        
      }

    });
  }
}
