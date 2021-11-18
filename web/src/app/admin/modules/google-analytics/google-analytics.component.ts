import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { HostnameService } from '../../../services/hostname.service';
import { SiteService } from '../../../services/site.service';
import { FormCheckerService } from '../../../services/form-checker.service';

@Component({
  selector: 'app-google-analytics',
  templateUrl: './google-analytics.component.html',
  styleUrls: ['./google-analytics.component.scss']
})
export class GoogleAnalyticsComponent implements OnInit {

  private formSubscription: Subscription;

  loading: boolean = true;

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {
    
    this._siteService.getGoogleAnalyticsAPI(
      this._hostService.getSiteId()
    ).subscribe((result: any) => {

      this.loading = false;  

      if (result.success) {
        
        this.loading = false;  
        this.createForm(result.data);
        this.checkForm();

      }
      else {
        this._snackBar.open(result.message, '', {
          duration: 2000,
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

  createForm(data?) {
    this.mainForm = this._fb.group({
      api: [(data && data.api) ? data.api : '', Validators.required]      
    });

    this.checkForm();
  }

  checkForm() {

    this.formSubscription = this.mainForm.valueChanges    
    .subscribe(x => {

        this._formCheckerService.formChanged(true);

        this.formSubscription.unsubscribe();

    });

  }

  onSubmit() {
    this.submitted = true;

    console.log('saving / updating settings')

    if (this.mainForm.status != "INVALID") {

      this._siteService.updateGoogleAnalyticsAPI(
        this._hostService.getSiteId(),
        this.mainForm.value.api        
      ).subscribe((result: any) => {

        if (result.success) {

          this._formCheckerService.formChanged(false);
          this.checkForm();

          this._snackBar.open('Settings updated', '', {
            duration: 2000,
          });
        }
        else {
          this._snackBar.open('Error. Please try again.', '', {
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

  }
}
