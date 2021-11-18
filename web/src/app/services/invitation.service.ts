import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';

//import config from '../config';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  //private webUrl; // = config.api_url;

  constructor(
    private _http: HttpClient,
    private _config: ConfigService
  ) { 
    //this.webUrl = this._config.getApiUrl();
  }

  getInvitation(siteId: string, id: string) {
    return this._http.get(this._config.getApiUrl() + '/api/invitation/' + siteId + '/' + id)
  }

  approveInvitation(siteId, invitationId, firstName, lastName, password) {
    let fullName = firstName + ' ' + lastName;

    return this._http.put(this._config.getApiUrl() + '/api/invitation/' + siteId + '/' + invitationId, {      
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      password: password
    });
  }
}
