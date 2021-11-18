import { Component, OnInit } from '@angular/core';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-live-view',
  templateUrl: './live-view.component.html',
  styleUrls: ['./live-view.component.scss']
})
export class LiveViewComponent implements OnInit {

  loading: boolean = true;
  activeUsers: Number = 0;
  socket: any;

  constructor(
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.socket = this._socketService.getSocket();

    this._siteService.getActiveUsers(this._hostService.getSiteId())
    .subscribe((result: any) => {

      this.loading = false;

      if (result.success) {
        this.activeUsers = result.data.length;      
      }

    }, err => {
      if (err.status != 200) {
        this.loading = false;
      }
    });

    this.socket.on('user_change', (data: number) => {
      this.activeUsers = data;
    });
  }

}
