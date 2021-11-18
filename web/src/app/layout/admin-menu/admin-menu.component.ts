import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxPermissionsService } from 'ngx-permissions';

import { UserinfoService } from '../../services/userinfo.service';
import { SidebarService } from '../../services/sidebar.service';
import { LayoutService } from '../../services/layout.service';
import { HostnameService } from '../../services/hostname.service';
import { SocketService } from '../../services/socket.service';
import { SiteService } from '../../services/site.service';


@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss']
})
export class AdminMenuComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private subscription2: Subscription;
  private subscription3: Subscription;
  private routeSubscription: Subscription;

  socket: any;

  layoutSize: number;
  user: any;
  siteTitle: string;
  isMultisite: boolean;
  version: string;

  managementMenu: boolean = false;
  sidebarShow: boolean = true;
  chatbotMessages: number = 0;

  chatPages: boolean = false;

  constructor(
    private _router: Router,
    private _userinfoService: UserinfoService,
    private _sidebarService: SidebarService,
    private _layoutSizeService: LayoutService,
    private _socketService: SocketService,
    private _hostService : HostnameService,
    private _snackBar: MatSnackBar,
    private _permissionsService: NgxPermissionsService,
    private _siteService: SiteService
  ) { 

    let firstTime = true;

    //#region listen for changes

    // If user is logged in
    this.subscription = this._userinfoService.loggedIn$.subscribe((value) => {
      if(!firstTime) {
        if(value) {
          this.user = this._userinfoService.getLocalInfo();
        }
      }
      else {
        firstTime = false;
      }
    });

    // If sidebar changes
    this.subscription2 = this._sidebarService.showSidebar$.subscribe((value) => {
      this.sidebarShow = value;
    });

    // If size changes
    this.subscription3 = this._layoutSizeService.currentSize$.subscribe((value) => {
      this.layoutSize = value;
      if(value > 1) {
        this.sidebarShow = true;
      }
      else {
        this.sidebarShow = false;
      }
    });

    // route listener
    this.routeSubscription = this._router.events.subscribe((event: Event) => { 
      if (event instanceof NavigationEnd) {
        this.checkIfManagementMenu(event.url);
      }
    });

    //#endregion

    // get system version
    this._siteService.getSystemVersion().subscribe((result: any) => {

      if(result.success) {
        this.version = result.data;
      }

    });    

  }

  /**
   * Check if is management menu. If it's then act properly
   * @param url 
   */
  checkIfManagementMenu(url: string) {
    let checkurl: any = url;
    checkurl = checkurl.split("/");

    if (checkurl[1] == 'management') {
      this.managementMenu = true;
    }
    else {

      if (checkurl[2] == 'chat') {
        this.chatbotMessages = 0;

        this.chatPages = true;
      }
      else {
        this.chatPages = false;
      }

      this.managementMenu = false;
    }
  }
 
  ngOnInit() {

    this.socket = this._socketService.getSocket();

    if(this._permissionsService.getPermission('SUPER_ADMIN') ||
      this._permissionsService.getPermission('ADMIN') || 
      this._permissionsService.getPermission('EDITOR') ||
      this._permissionsService.getPermission('AUTHOR')
    ) {
      this.socket.on('new message', (data: any) => {

        if(!this.chatPages) {

          let snackBarRef = this._snackBar.open('New message from customer', 'Chatbot', {
            duration: 2000,
          });

          snackBarRef.onAction().subscribe(() => {
            this._router.navigate(['admin/chat']);
          });

          this.chatbotMessages = this.chatbotMessages + 1;     

        }
      });
    }

    this.checkIfManagementMenu(this._router.url);    

    this.siteTitle = this._hostService.getSiteTitle();
    this.isMultisite = this._hostService.isMultisite();

    this.layoutSize = this._layoutSizeService.getSize();

    if(this._layoutSizeService.getSize() > 1) {
      this.sidebarShow = true;
    }
    else {
      this.sidebarShow = false;
    }
 
    this.user = this._userinfoService.getLocalInfo();
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }

    if(this.subscription2) {
      this.subscription2.unsubscribe();
    }

    if(this.subscription3) {
      this.subscription3.unsubscribe();
    }

    if(this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  hideSidebar() {
    this.sidebarShow = !this.sidebarShow;
  }

}
