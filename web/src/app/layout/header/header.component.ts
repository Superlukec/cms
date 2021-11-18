import { Component, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { PageInfoService } from '../../services/page-info.service';
import { SidebarService } from '../../services/sidebar.service';
import { LayoutService } from '../../services/layout.service';
// import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private subscription2: Subscription;

  layoutSize: number;
  link: string;
  siteTitle: string;
  setShowHeader: boolean;
  //version: string;

  visible: boolean;
  isAdmin: boolean;

  @Input() html: string;
  @Input() set admin(admin: boolean) {
    this.isAdmin = admin;
    if(admin) {
      this._titleService.setTitle('Admin');

      /*
      this._siteService.getSystemVersion().subscribe((result: any) => {

        if(result.success) {
          this.version = result.data;
        }

      });*/
    }
  }
  @Input() set show(show: boolean) {
    this.visible = show;
  }

  constructor(
    private _titleService: Title,
    private _pageInfoService: PageInfoService,
    private _sidebarService: SidebarService,
    private _layoutSizeService: LayoutService,
    // private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _hostService : HostnameService
  ) { 

    this.subscription = this._pageInfoService.link$.subscribe(value => {
      this.link = value;
    });

    this.subscription2 = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.layoutSize = value;
    });

  }
  
  ngOnInit() {
    this.layoutSize = this._layoutSizeService.getSize();  
    this.siteTitle = this._hostService.getSiteTitle();
  }

  onHeaderFinished() {
    this.setShowHeader = true;
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
    if(this.subscription2) {
      this.subscription2.unsubscribe();
    }
  }

  showSidebar() {
    this._sidebarService.setSidebar(true);
  }
  
}
