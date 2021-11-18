/**
 * Service to get the domain
 */

import { Injectable, PLATFORM_ID, Optional, Inject, Injector } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { SiteService } from './site.service';
import { ConfigService } from './config.service';

import { RESPONSE, REQUEST } from '@nguniversal/express-engine/tokens';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class HostnameService {

  hostname: string;
  site_id: string;
  siteTitle: string;
  multisite: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _siteService: SiteService,
    private injector: Injector,
    @Optional() @Inject(RESPONSE) private response: any,
    @Optional() @Inject(REQUEST) private request: any,
    private _config: ConfigService
  ) {

    if (isPlatformServer(this.platformId)) {
      /**
       * If crawler
       */

      // https://github.com/angular/universal/issues/934

      let req = this.request; 

      if(this._config.isDevelopment()) {
        this.hostname = 'kompas-telekom.com';
      }
      else {
        this.hostname = req.get('host');
      }

    }
    else {
      /**
       * If web client
       */

      /**
       * @TODO tmp
       */
      if(this._config.isDevelopment()) {
        this.hostname = 'kompas-telekom.com';
      }
      else {
        this.hostname = window.location.host;
      }
    }

  }

  init() {

    return new Promise((resolve, reject) => {

      // get ID and title from host
      this._siteService.getIdAndTitleFromHost(this.hostname).subscribe((result: any) => {

        if (result.success) {

          this.site_id = result.data._id;
          this.siteTitle = result.data.title;
          this.multisite = result.data.multisite;

          resolve(result.data);
        }
        else {
          reject();
        }

      }, err => {

        if (err.status != 200) {
          reject();
        }
      });

    });

  }

  getHostname() {
    return this.hostname;
  }

  getSiteId() {
    return this.site_id;
  }

  getSiteTitle() {
    return this.siteTitle;
  }

  isMultisite() {
    return this.multisite;
  }


}
