import { Injectable } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';
import { UserinfoService } from './userinfo.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { HttpOptionsService } from './http-options.service';
import { HostnameService } from './hostname.service';
import { UnderConstructionService } from './under-construction.service';
import { SocketService } from './socket.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LoadDataService {

  constructor(
    private permissionsService: NgxPermissionsService,
    private cookieService: CookieService,
    private _userinfoService: UserinfoService,
    private _httpOptionsService: HttpOptionsService,
    private _hostService: HostnameService,
    private _underConstructionService: UnderConstructionService,
    private _socketService: SocketService,
    private _config: ConfigService
  ) {

  }

  load(): Promise<any> {

    return new Promise((resolve, reject) => {

      // config settings
      this._config.getConfigSettings().then((val: any) => {

        // we get site ID
        this._hostService.init().then((val: any) => {

          // socket.io service
          this._socketService.setupSocketConnection(this._hostService.getSiteId()).then((editor) => {

            // we refresh header - so that the site id will be included
            this._httpOptionsService.refreshHeader();

            if (this.cookieService.get('jwtToken')) {

              this._userinfoService.getUserInfo().subscribe((data: any) => {

                // @todo everybody can see underconstruction page
                this._underConstructionService.setUnderConstruction(false);

                if (data && data.success) {

                  let user = data.data;

                  this._userinfoService.setLocalInfo(user);

                  if (user.role == 0) {
                    this.permissionsService.addPermission('SUPER_ADMIN');
                  }
                  else if (user.role == 1) {
                    this.permissionsService.addPermission('ADMIN');
                  }
                  else if (user.role == 2) {
                    this.permissionsService.addPermission('EDITOR');
                  }
                  else if (user.role == 3) {
                    this.permissionsService.addPermission('AUTHOR');
                  }
                  else if (user.role == 4) {
                    this.permissionsService.addPermission('VISITOR');
                  }
                  else if (user.role == 5) {
                    this.permissionsService.addPermission('EXCHANGE');
                  }


                  resolve(true)

                }
                else {

                  resolve(true)
                }

              }, err => {
                if (err.status != 200) {


                  resolve(true)

                }
              })

            }
            else {
              this._userinfoService.setLoggedIn(false);

              // we check if page is under construction
              this._underConstructionService.getUnderConstructionInfo(this._hostService.getSiteId()).subscribe((data: any) => {

                if (data && data.success) {
                  this._underConstructionService.setUnderConstruction(!data.data.public);

                  resolve(false);
                }
                else {

                  resolve(false);
                }

              }, err => {
                if (err.status != 200) {


                  resolve(false);

                }
              });

            }


          });


        }).catch(error => {

          // if error we don't show nothing
          this._userinfoService.setLoggedIn(false);

          resolve(false);

        });


      }).catch(error => {

        // if error we don't show nothing
        this._userinfoService.setLoggedIn(false);

        resolve(false);

      });

    });

  }

}
