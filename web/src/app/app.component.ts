//declare function require(name: string): any;

// declare ga as a function to set and sent the events
declare let ga: Function;

import { Component, PLATFORM_ID, Inject, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser, isPlatformServer, DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SiteService } from './services/site.service';
import { HostnameService } from './services/hostname.service';
import { LayoutService } from './services/layout.service';
import { SidebarService } from './services/sidebar.service';
import { FormCheckerService } from './services/form-checker.service';
import { SocketService } from './services/socket.service';
import { UserinfoService } from './services/userinfo.service';
import { InstallSiteService } from './services/install-site.service';
import { FaviconService } from './services/favicon.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  public innerWidth: any;

  socket: any;
  chatbots: any = [];

  hostname: string;

  loading: Boolean = true;
  ckEditorLoaded: Boolean = false;
  isAdminPage: Boolean = false;
  isLogin: Boolean = true;

  firstTimeChat: boolean = true;
  firstTimeLoading: Boolean = true;

  headerHtml: String;
  footerHtml: String;
  cookiesEnabled: boolean;
  cookiesInfo: any;

  chatSettings: any;
  chatText: any;

  // for SSR
  hideSsr: boolean = true;

  constructor(
    private _siteService: SiteService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _sidebarService: SidebarService,
    private _layoutSizeService: LayoutService,
    private _formCheckerService: FormCheckerService,
    private _cookieService: CookieService,
    private _socketService: SocketService,
    private _userInfoService: UserinfoService,
    private _installService: InstallSiteService,
    private _faviconService: FaviconService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // init navigation - APP_INITIALIZER fix
    _router.initialNavigation();
   
    if (this._hostService.getSiteId() == null) {

      // we check if we need to install
      
      this._installService.shouldInstall().subscribe((result: any) => {

        this.loading = false;
        this.hideSsr = false;

        if (result.should) {

          // navigate to install page
          if(this._router.url != '/install') {            
            window.location.href = '/install';
          }
          
        }
        else {

          /**
           * If page doesn't exists we redirect to another page
           */
          if (isPlatformBrowser(this.platformId)) {
            /**
             * @todo add real link
             */
            //window.location.href = 'https://google.com';
          }
         
        }
  
      }, err => {
        if (err.status != 200) {
          this._snackBar.open('Error on the server', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });


    }
    else {

      // socket.io dodan
      this._socketService.sayHello(this._hostService.getSiteId(), this._userInfoService.getLocalInfo());    

      this.subscription = this._router.events.subscribe((event: Event) => {     

        if (event instanceof NavigationStart) {

          // before navigation we show loading bar
          if (!this._formCheckerService.isFormChanged()) {
            this.loading = true;
          }

        }
        else if (event instanceof NavigationEnd) {

          // Hide loading indicator
          // We remove scripst and css according to the page we are visiting
          let url: any = event.url;
          url = url.split("/");

          if (url[1] == 'admin' || url[1] == 'management') {
            if (this._layoutSizeService.getSize() < 2) {
              this._sidebarService.setSidebar(false);
            }
            this.firstTimeLoading = true;
            this.isAdminPage = true;

            if (isPlatformBrowser(this.platformId)) {

              if(this.headerHtml != '' || this.footerHtml != '') {
                this.headerHtml = '';
                this.footerHtml = '';
                this._layoutSizeService.removeElementsById(['client-theme', 'client-script']);
              }

            }

            /**
             * If admin, we just show admin page
             */
            this.loading = false;
          }
          else {

            this.isAdminPage = false;

            if (this.firstTimeLoading) {
              this.loadSiteTemplate(event.url);
              this.firstTimeLoading = false;
            }
            else {
              this.loading = false;
            }

            let url: any = event.url;
            url = url.split("/");
            if(url[1]) {
              url[1] = url[1].match(/^[^\#\?]+/)[0];
            }

            if (
              url[1] == 'login' ||
              url[1] == 'logout' ||
              url[1] == 'install' ||              
              url[1] == 'invitation' ||
              url[1] == 'portal' ||
              url[1] == 'preview' ||
              url[1] == '404.html'
            ) {
              //this._pageInfoService.hideHeader();
              this.isLogin = true;
            }
            else {
              //this._pageInfoService.showHeader();
              this.isLogin = false;
            }

            // show header by default
            //

          }

        } else if (event instanceof NavigationError) {
          // Hide loading indicator
        } else if (event instanceof NavigationCancel) {
          this.loading = false;
        }

      });

    }

  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {

      //#region favicon
      
      // we get favicon
      this._faviconService.getFavicon(this._hostService.getSiteId()).subscribe((result: any) => {
        
        if(result && result.success && result.data) {
          // we setup favicon          
          this._faviconService.setFavicon(result.data);
        }
        else {
          // we setup default favicon
          this._faviconService.setFavicon('assets/favicon.ico');
        }

      });

      //#endregion
      

      //#region window size
      this.innerWidth = window.innerWidth;
      this.calculateSize(this.innerWidth);
      //#endregion

    }

    this.socket = this._socketService.getSocket();       
  }

  loadSiteTemplate(url: string) {

    this._siteService.getSiteTemplate(this._hostService.getSiteId(), url).subscribe((result: any) => {

      if (result.success) {

        let loadStyle  = new Promise((resolve, reject) => {

          if (isPlatformBrowser(this.platformId)) {
            this.hideSsr = false;

            this._layoutSizeService.loadStyle('client-theme', '/assets/' + result.data.themeId + '.css').then(() => {
              this._layoutSizeService.loadScript('client-script', '/assets/' + result.data.themeId + '.js', false, true).then(() => {
  
                if(result.data.google_maps_api) {
                  this._layoutSizeService.loadScript('google-maps', 'https://maps.googleapis.com/maps/api/js?key=' + result.data.google_maps_api, false, false).then(() => {
                    // we setup google analytics
                    if(result.data.google_analytics_api) {
                      ga('create', result.data.google_analytics_api, 'auto'); 
                    }
                  });
                }                
                resolve();
              });
            });         
  
          }
          else {
            resolve();
          }

        });

        loadStyle.then(() => {

          // we set the layout
          this.headerHtml = result.data.header;
          this.footerHtml = result.data.footer;

          if(!this._cookieService.get('cookieConsent')) {
            this.cookiesEnabled = result.data.cookies_enabled;
            this.cookiesInfo = result.data.cookies_info;
          }

          this.chatSettings = result.data.chat_settings;
          this.chatText = result.data.chat_text;

          // TMP - kasneje narediti gleda na vlogo
          if(this.firstTimeChat) {

            // don't show chatbot dialog on login page and pages, which are not public
            if(result.data.chat_enabled && result.data.public && !this.isLogin) {

              if(!this._cookieService.get('chatOff')) {

                this.chatbots.push({
                  chat_id : 'Id-' + Date.now()
                })
                this.chatbots = this.chatbots.slice();  // Inject ne zazna spremembe v polju               

              }

              this.firstTimeChat = false;

            }
          }

          this.loading = false;

        });

      }
      else {
        this.loading = false;
        this.hideSsr = false;
      }

    }, err => {
      if (err.status != 200) {
        this.loading = false;
        this.hideSsr = false;

        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });

  }

  //#region hostListener

  // we listen for a(href)
  @HostListener('window:click', ['$event'])
  onClick(event) {

    if(event.composedPath) {  // Edge don't support (Object doesn't support property or method 'composedPath')
      
      const path = event.composedPath() as Array<any>;

      const firstAnchor = path.find(p => {
        if(p.tagName) {
          return p.tagName.toLowerCase() === 'a'
        }      
      });
      if (firstAnchor && !firstAnchor.hasAttribute('routerlink')) {
        event.preventDefault();

        const href = firstAnchor.getAttribute('href');

        let exceptions = ['http', 'mailto', 'tel'];
        let exceptionFound = false;

        for(let i = 0; i < exceptions.length; i++) {
          if(!exceptionFound && (href.indexOf(exceptions[i]) != -1)) {
            exceptionFound = true;
          }
        }

        if(!exceptionFound) {
          this._router.navigateByUrl(href);          
        }
        else {    
          if(window) {      
            window.location.href = href;
          }
        }

        
      }
    }
    
  }


  // we listen for resize
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth;
      this.calculateSize(this.innerWidth);
    }
  }

  calculateSize(width: number) {

    if (width < 576) {
      this._layoutSizeService.setSize(0);
    }
    else if (width >= 576 && width < 768) {
      this._layoutSizeService.setSize(1);
    }
    else if (width >= 768 && width < 992) {
      this._layoutSizeService.setSize(2);
    }
    else if (width >= 992 && width < 1200) {
      this._layoutSizeService.setSize(3);
    }
    else if (width >= 1200) {
      this._layoutSizeService.setSize(4);
    }

  }

  //#endregion

  ngOnDestroy() {

    if(this.subscription) {
      this.subscription.unsubscribe();
    }

  }

}
