import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  constructor(
    private http: HttpClient,
    private _config: ConfigService
  ) { }

  login(siteId: string, username: string, password: string) {

    return this.http.post(this._config.getApiUrl() + '/login', { 
      siteId: siteId,
      username: username, 
      password: password 
    });

  }

  forgot(username: string) {
    
    return this.http.post(this._config.getApiUrl() + '/forgot/pass', { username: username });

  }

  resetPassword(forgotPasswordId: string, password: string) {
    return this.http.post(this._config.getApiUrl() + '/forgot/update', { 
      forgotPasswordId: forgotPasswordId, 
      password: password 
    });
  }

  checkForgotId(id: string) {

    return this.http.get(this._config.getApiUrl() + '/forgot/pass/' + id);

  }

  requestEmailValidation(username: string) {

    return this.http.post(this._config.getApiUrl() + '/request/validation', { username: username });

  }

}
