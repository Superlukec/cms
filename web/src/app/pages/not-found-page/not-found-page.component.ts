import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PageInfoService } from '../../services/page-info.service';
import { HostnameService } from '../../services/hostname.service';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {

  noSiteOnServerError: boolean = false;

  constructor(
    private titleService: Title,
    private _hostService: HostnameService
  ) { 
  }

  ngOnInit() {

    if (this._hostService.getSiteId() == null) {

      this.noSiteOnServerError = true;

    }

  }

  ngAfterViewInit() {
    this.titleService.setTitle('404');
  }

}
