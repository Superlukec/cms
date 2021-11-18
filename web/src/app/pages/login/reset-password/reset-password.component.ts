import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { SiteService } from '../../../services/site.service';
import { AuthentificationService } from '../../../services/authentification.service';
import { PageInfoService } from '../../../services/page-info.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  loading: boolean = true;
  forgotPasswordLinkStatus: boolean;
  passwordChanged: boolean;

  @Input() id: string;

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _authenticationService: AuthentificationService,
    private _titleService: Title,
    private _pageInfoService: PageInfoService
  ) {
    //this._pageInfoService.hideHeader();
   }

  ngOnInit() {
    //this._pageInfoService.hideHeader();
    this._titleService.setTitle('Reset password');
    

    console.log(this.id)


    this._authenticationService.checkForgotId(this.id).subscribe(
      (data: any) => {

        this.loading = false;

        if(data) {          
          
          this.forgotPasswordLinkStatus = data.success;    
          this.createForm();
          
        } 
        
      }
    );

    
  }

  createForm() {
    this.mainForm = this._fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      if(this.mainForm.value.password == this.mainForm.value.password2) {


        this._authenticationService.resetPassword(
          this.id,
          this.mainForm.value.password
        ).subscribe((result: any) => { 
        
          if(result && result.success) {
            this._snackBar.open('Your password was changed successfully', '', {
              duration: 2000,
            });
            
            this.submitted = false;
            
            this.mainForm.patchValue({ password: '' });
            this.mainForm.patchValue({ password2: '' });

            this.passwordChanged = true;
          }
          else {            
            this._snackBar.open(result.message, '', {
              duration: 2000,
            });
          }
          
        }, err => {  
          if(err.status != 200) {
            this._snackBar.open('Error: ' + (err.error && err.error.message) ? (err.error.message) : (err.statusText), '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }
      else {
        this._snackBar.open('Passwords doesn\'t match', '', {
          duration: 2000,
        });
      }

    }
    else {
      this._snackBar.open('Please enter data', '', {
        duration: 2000,
      });
    }
  }

  get f() { return this.mainForm.controls; }

}
