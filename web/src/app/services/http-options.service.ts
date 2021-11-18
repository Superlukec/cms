import { HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class HttpOptionsService {

  

  httpOptions = {
    headers: new HttpHeaders({ 'Authorization': this.cookieService.get('jwtToken') })
  };

  constructor(
    private cookieService: CookieService
  ) { }

  getHeader() {
    return this.httpOptions;
  }
  
  getToken() {
    return this.cookieService.get('jwtToken');
  }

  refreshHeader(): void {
    this.httpOptions.headers = new HttpHeaders({ 'Authorization': this.cookieService.get('jwtToken') });
  }

  removeHeader(): void {
    this.httpOptions.headers = new HttpHeaders({ 'Authorization': null });
  }
}
