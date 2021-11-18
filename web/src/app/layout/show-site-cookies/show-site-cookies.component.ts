import { Component, OnInit, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-show-site-cookies',
  templateUrl: './show-site-cookies.component.html',
  styleUrls: ['./show-site-cookies.component.scss']
})
export class ShowSiteCookiesComponent implements OnInit {

  hideCookieConsent: boolean;
  expandBox: boolean;
  cookieInfo = {};

  @Input() set cookie(info: any) {
    this.cookieInfo = info;
  }

  constructor(
    private _cookieService: CookieService
  ) { }

  ngOnInit() {
  }

  agree() {
    let expiredDate = new Date();
    expiredDate.setDate( expiredDate.getDate() + 30 );

    this._cookieService.set('cookieConsent', 'true', expiredDate, '', '', false, 'Strict');
    this.hideCookieConsent = true;
  }

  moreInfo() {
    this.expandBox = !this.expandBox;
  }

}
