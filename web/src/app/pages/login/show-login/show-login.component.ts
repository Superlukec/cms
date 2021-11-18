import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';

import { AuthentificationService } from '../../../services/authentification.service';
import { HttpOptionsService }      from '../../../services/http-options.service';
import { PageInfoService } from '../../../services/page-info.service';
import { UserinfoService } from '../../../services/userinfo.service';
import { HostnameService } from '../../../services/hostname.service';
import { UnderConstructionService } from '../../../services/under-construction.service';


@Component({
  selector: 'app-show-login',
  templateUrl: './show-login.component.html',
  styleUrls: ['./show-login.component.scss']
})
export class ShowLoginComponent implements OnInit {

  mainForm: FormGroup;
  submitted: boolean = false;
  showError: boolean = false;
  showErroMessage: String = '';

  returnUrl: string;
  page: string;

  constructor(
    private permissionsService: NgxPermissionsService,
    private _userinfoService: UserinfoService,    
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder, 
    private _cookieService: CookieService,
    private _httpOptionsService: HttpOptionsService,
    private _authenticationService: AuthentificationService,
    private _snackBar: MatSnackBar,
    private _titleService: Title,
    private _pageInfoService: PageInfoService,
    private _hostService: HostnameService,
    private _underConstructionService: UnderConstructionService
  ) { 
    //this._pageInfoService.hideHeader();
  }

  ngOnInit() {
    //this._pageInfoService.hideHeader();
    this.createForm();
    
    this._titleService.setTitle('Login');
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
  }

  createForm() {
    this.mainForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]      
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.mainForm.controls; }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this.showError = false;

      this._authenticationService.login(this._hostService.getSiteId(), this.mainForm.value.email, this.mainForm.value.password).subscribe((result: any) => {  

        //this._pageInfoService.hideHeader(false);
        
        let expiredDate = new Date();
        expiredDate.setDate( expiredDate.getDate() + 30 );

        this._cookieService.set('jwtToken', result.token, expiredDate, '', '', false, 'Strict');

        this._httpOptionsService.refreshHeader();

        /*
        this._snackBar.open('Login successful. Redirecting ...', '', {
          duration: 2000,
        });*/

        let user = result.user;

        this._underConstructionService.setUnderConstruction(false);

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

        
        if(this.returnUrl && this.returnUrl != '/') {
          console.log('navigate ' + this.returnUrl)
          this._router.navigate([this.returnUrl]);
        }
        else {   
          
          if (user.role == 4) {
            this._router.navigate(['portal']);
          } else if (user.role == 5) {
            this._router.navigate(['admin/transfer']);
          } else {
            this._router.navigate(['admin']);
          }
          
        }
      
      }, err => {  

        if(err.error && err.error.not_validate_hint) {
          //this.another_email_validate_link = true;
        }

        if(err.status != 200) {
          this.showError = true;
          this.showErroMessage = err.error.message;

          /*
          this._snackBar.open(err.error.message, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });*/
        }
      });

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }
    
  }

}
