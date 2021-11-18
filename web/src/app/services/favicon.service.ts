import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from './http-options.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FaviconService {

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService,
    @Inject(DOCUMENT) private document: Document
  ) { }


  setFavicon(faviconUrl: string) {

    return new Promise((resolve, reject) => {

      const head = this.document.getElementsByTagName('head')[0];

      let themeLink = this.document.getElementById(
        'favicon'
      ) as HTMLLinkElement;
      if (themeLink) {
        themeLink.href = faviconUrl;
      } else {
        const style = this.document.createElement('link');
        style.id = 'favicon';
        style.rel = 'icon';
        style.type = 'image/x-icon';
        style.href = `${faviconUrl}` + '?v=' + Date.now();
        style.onload = () => { 
          console.log('favicon has loaded'); 
          resolve();
        };
        head.appendChild(style);
      }

    });
  }

  saveFavicon(siteId:string, url: string) {
    return this._http.post(this._config.getApiUrl() + '/api/favicon/', { 
      site_id: siteId,
      url: url 
    }, this._httpOptionsService.getHeader())
  }

  deleteFavicon(siteId: string) {
    return this._http.delete(this._config.getApiUrl() + '/api/favicon/' + siteId, this._httpOptionsService.getHeader())
  }

  getFavicon(siteId: string) {
    return this._http.get(this._config.getApiUrl() + '/api/favicon/' + siteId, this._httpOptionsService.getHeader())
  }

}
