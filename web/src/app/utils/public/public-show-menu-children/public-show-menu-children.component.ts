import { Component, OnInit, Input } from '@angular/core';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';

@Component({
  selector: 'app-public-show-menu-children',
  templateUrl: './public-show-menu-children.component.html',
  styleUrls: ['./public-show-menu-children.component.scss']
})
export class PublicShowMenuChildrenComponent implements OnInit {

  loading: Boolean = true;


  @Input() set pageId(id: string) {
    this.loading = true;
    this.getPostChildren(id);
  }

  children: any = [];

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
  ) { }

  ngOnInit() {

    
  }

  getPostChildren(id) {
    
    this._siteService.getPostChildren(this._hostService.getSiteId(), id).subscribe((result: any) => {

      this.loading = false;

      if (result && result.success) {
        this.children = result.data;
      }

    });

  }

}
