import { Injectable, PLATFORM_ID, Inject } from '@angular/core';

import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpOptionsService } from '../services/http-options.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from './config.service';

// import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class UnderConstructionService {
  underConstruction: boolean = false;

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _config: ConfigService
  ) { 

  }

  getUnderConstructionInfo(id: string) {
    return this._http.get(this._config.getApiUrl() + '/api/site/construction/info/' + id, this._httpOptionsService.getHeader())
  }

  isUnderConstruction() {
    return this.underConstruction;
  }

  setUnderConstruction(isUnderConstruction: boolean) {
    this.underConstruction = isUnderConstruction;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {  

    return new Promise(resolve => {     

      if(this.underConstruction) {        
        resolve(false); 
        
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = '/login';
        }
      }
      else {
        resolve(true);
      }

    });

    
   
  }
}
