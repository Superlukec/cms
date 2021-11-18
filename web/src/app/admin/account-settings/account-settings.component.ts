import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SiteService } from '../../services/site.service';


@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  loading: Boolean = true;

  changePass: Boolean = false;  
  mainForm: FormGroup;
  submitted = false;

  avatarColor: string;
  textColor: String = 'black';
  initials: String;

  constructor(
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _siteService: SiteService,
  ) { }

  ngOnInit() {

    this._siteService.getUserProfile().subscribe((result: any) => {

      this.loading = false;

      if (result.success) {  
        this.createForm(result.data);        
      }
      else {
        this.createForm();

        this._snackBar.open(result.message, '', {
          duration: 2000,
        });
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

  createForm(data?) {

    if(data) {

      if(data.first_name && data.last_name) {
        this.initials = data.first_name[0] + data.last_name[0];
      }

      if(data.color) {
        this.avatarColor = data.color;
        this.textColor = this.getContrast(data.color);
      }

    }

    this.mainForm = this._fb.group({
      email: [(data && data.email) ? data.email : '', Validators.required],      
      first_name: [(data && data.first_name) ? data.first_name : '', Validators.required],
      last_name: [(data && data.last_name) ? data.last_name : '', Validators.required],
    });    

  }

  get f() { return this.mainForm.controls; }

  onSubmit() {

    this.submitted = true;

    if (this.mainForm.status != "INVALID") {

      this._siteService.updateUserProfile(
        this.mainForm.value.email,
        this.mainForm.value.first_name,
        this.mainForm.value.last_name,
        this.avatarColor,
        this.mainForm.value.password
      ).subscribe((result: any) => {
            
        if(result.success) {
          this._snackBar.open('Saved', '', {
            duration: 2000,
          });        
        }
        else {
          this._snackBar.open('Error: ' + result.message, '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }

      }, err => {

        if (err.status != 200) {
          // snackbar
          this._snackBar.open('Error', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

  onPasswordChange(data) {
    if(!(data instanceof Event)) {
      this.mainForm.patchValue({
        password: data
      });
    }
  }

  changePassword() {
    this.mainForm.addControl('password', new FormControl('', [Validators.required, Validators.minLength(6)]));
    
    this.changePass = true;
  }

  onAvatarChange(color: string) {
    this.textColor = this.getContrast(color);
  }

  changeName() {
    this.initials = this.mainForm.value.first_name[0] + this.mainForm.value.last_name[0];
  }

  getContrast(hexcolor: string): string {

    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
      hexcolor = hexcolor.slice(1);
    }
  
    // Convert to RGB value
    let r = parseInt(hexcolor.substr(0,2),16);
    let g = parseInt(hexcolor.substr(2,2),16);
    let b = parseInt(hexcolor.substr(4,2),16);
  
    // Get YIQ ratio
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
    // Check contrast
    return (yiq >= 128) ? 'black' : 'white';
  
  };

}
