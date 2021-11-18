import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthentificationService } from '../../../services/authentification.service';
import { PageInfoService } from '../../../services/page-info.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  forgotLinkSent = false;

  constructor(
    private _fb: FormBuilder, 
    private _titleService: Title,
    private _snackBar: MatSnackBar,
    private _authenticationService: AuthentificationService,
    private _pageInfoService: PageInfoService
  ) { 
    //this._pageInfoService.hideHeader();
  }

  get f() { return this.mainForm.controls; }

  ngOnInit() {
    //this._pageInfoService.hideHeader();
    this._titleService.setTitle('Reset password');
    
    this.createForm();
  }

  createForm() {
    this.mainForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this._authenticationService.forgot(this.mainForm.value.email).subscribe((result: any) => { 
        
        if(result && result.success) {
          this._snackBar.open('Please check your e-mail', '', {
            duration: 2000,
          });
          
          this.forgotLinkSent = true;
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
      this._snackBar.open('Please enter data', '', {
        duration: 2000,
      });
    }   
  }

}
