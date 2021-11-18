
import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { CookieService } from 'ngx-cookie-service';
import { HttpOptionsService } from './http-options.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { UserinfoService } from './userinfo.service';
import { FormCheckerService } from './form-checker.service';
import { ConfirmDialogComponent } from '../utils/confirm-dialog/confirm-dialog.component';

@Injectable()
export class AuthguardService {

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private permissionsService: NgxPermissionsService,
    private router: Router,     
    private _cookieService: CookieService,
    private _userinfoService: UserinfoService,
    private _formCheckerService: FormCheckerService,
    private _httpOptionsService: HttpOptionsService        
  ) { }


  resolve() {

    if(this._cookieService.get('jwtToken')) {

      this._userinfoService.getUserInfo().subscribe((data: any) => {

        if(data && data.success) {

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

          this._userinfoService.setLoggedIn(true);
          return true;      

        }
        else {
          this.logout();

          return false;
        }

        

      }, err => {         
        if(err.status != 200) {  
          
          this.logout();

          return false;
        }
      })

      /*
      this._userinfoService.setLoggedIn(true);
      return true;      
      */
    }
    else {
      this.permissionsService.flushPermissions();

      this._userinfoService.setLoggedIn(false);
      return false;
    }
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {  

    return new Promise(resolve => {   

      if(this._cookieService.get('jwtToken')) {
        this._userinfoService.setLoggedIn(true);
        resolve(true);      
      }
      else {
        this._userinfoService.setLoggedIn(false);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        resolve(false);
      }

    });
   
  }

  canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) { 
   
    return new Promise(resolve => {

    if(this._formCheckerService.isFormChanged()) {
      
        this.confirmDialogRef = this._dialog.open(
          ConfirmDialogComponent,
          {
            width: '350px',
            data: {
              title: 'Unsaved data',
              text: 'You didn\'t saved data. Leave anway?',
              leftButton: 'Cancel',
              rightButton: 'Yes'
            },
            disableClose: true
          }
        );

        this.confirmDialogRef.afterClosed().subscribe(proceed => {
          if (proceed) {
            this._formCheckerService.formChanged(false);
            resolve(true);
          }
          else {          
            resolve(false);
          }
        });

        
      }
      else {
        resolve(true);
      }

    });
    
  }

  logout(redirect?) {     


  
    this.permissionsService.flushPermissions();
    this._httpOptionsService.removeHeader();
    
    this._cookieService.set('jwtToken', '', new Date('Thu, 01 Jan 1970 00:00:01 GMT'), '', '', false, 'Strict');
    this._cookieService.delete('jwtToken', '' , '');

    this._cookieService.deleteAll('', '');

    this._userinfoService.setLoggedIn(false);

    

    
    setTimeout(() => {
      if(redirect != false) {
        this.router.navigate(['login']);
      }
    }, 2000);


    
  }

}

