import { Component, OnInit } from '@angular/core';

import { SiteService } from '../../../../services/site.service';
import { HostnameService } from '../../../../services/hostname.service';

@Component({
  selector: 'app-dash-show-quick-stats',
  templateUrl: './dash-show-quick-stats.component.html',
  styleUrls: ['./dash-show-quick-stats.component.scss']
})
export class DashShowQuickStatsComponent implements OnInit {

  loading: boolean = true;
  stats: any;

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService
  ) { }

  ngOnInit(): void {
    this._siteService.getStats(this._hostService.getSiteId())
    .subscribe((result: any) => {

      this.loading = false;

      if (result.success) {

        this.stats = result.data;
        

      }

    }, err => {
      if (err.status != 200) {
        this.loading = false;
      }
    });
  }

}
