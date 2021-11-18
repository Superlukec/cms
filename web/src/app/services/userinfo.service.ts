import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { HttpOptionsService } from './http-options.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserinfoService {

  userInfo = {};
  
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(false); //(this.loggedIn);

  constructor(
    private _http: HttpClient,
    private _httpOptionsService: HttpOptionsService,
    private _config: ConfigService
  ) { 
  }

  setLocalInfo(userInfo) {
    this.userInfo = userInfo;
  }

  getLocalInfo() {
    return this.userInfo;
  }

  getUserInfo() {
    return this._http.get(this._config.getApiUrl() + '/api/user/info', this._httpOptionsService.getHeader())
  }

  /*
  updateUserInfo(userInfo) {
    return this._http.put(this._config.getApiUrl() + '/api/user/info', userInfo, this._httpOptionsService.getHeader())
  }*/

  /*
  getAllUsersAdmin(index?, size?, filter?) {

    let url_query = '';

    if(index != null && size != null) {
      url_query = '?index=' + index + '&size=' + size;

      if(filter) {
        url_query += '&filter=' + filter;
      }
    }
    else {
      if(filter) {
        url_query += '?filter=' + filter;
      }
    }

    return this._http.get(this._config.getApiUrl() + '/api/user/all' + url_query, this._httpOptionsService.getHeader())
  }*/

  saveNewUserAdmin(userInfo) {
    return this._http.post(this._config.getApiUrl() + '/api/user', userInfo, this._httpOptionsService.getHeader())
  }

  /*
  deleteUser(id) {
    return this._http.delete(this._config.getApiUrl() + '/api/user/' + id, this._httpOptionsService.getHeader()) 
  }*/

  /*
  getFilterUsers(search: string, limit?: number) {
    
    if(!limit) {
      limit = 25;
    }

    return this._http.get(this._config.getApiUrl() + '/api/user/search/' + limit + '/' + search)
  }*/

  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  getLoggedIn() {
    return this.loggedIn;
  } 

}
