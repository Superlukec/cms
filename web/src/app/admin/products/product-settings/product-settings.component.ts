import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { FormCheckerService } from '../../../services/form-checker.service';

@Component({
  selector: 'app-product-settings',
  templateUrl: './product-settings.component.html',
  styleUrls: ['./product-settings.component.scss']
})
export class ProductSettingsComponent implements OnInit {

  private formSubscription: Subscription;

  loading: boolean = true;

  mainForm: FormGroup;
  submitted = false;
  forms = [];

  constructor(
    private _siteService: SiteService,
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService
  ) { }

  ngOnInit(): void {

    this._siteService.getProductSiteSettings(this._hostService.getSiteId()).subscribe((result: any) => {

      if (result.success) {
        this.createForm(result.data.product_settings);

        this._siteService.getForms(this._hostService.getSiteId()).subscribe((result: any) => {
      
          if (result.success) {
            this.forms = result.data;
          }
          
          this.loading = false;
    
        }, err => {
          this.loading = false;
        });
        

      }
      else {
        this.loading = false;  
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

  get f() { return this.mainForm.controls; }

  createForm(data?) {

    this.mainForm = this._fb.group({
      showForm: [(data && data.show_form) ? data.show_form : false, Validators.required]      
    });

    if(data.show_form) {
      this.mainForm.addControl('formId', new FormControl((data && data.form_id) ? data.form_id : '', [Validators.required]));
    }

    this.checkForm();
  }

  checkForm() {

    this.formSubscription = this.mainForm.valueChanges    
    .subscribe(x => {

        this._formCheckerService.formChanged(true);

        this.formSubscription.unsubscribe();

    });

  }

  changeForm() {

    if(this.mainForm.value.showForm == 'true') {
      if(!this.mainForm.contains('formId')) {
        this.mainForm.addControl('formId', new FormControl('', [Validators.required]));
      }
    }
    else {
      if(this.mainForm.contains('formId')) {
        this.mainForm.removeControl('formId');
      }
    }
    

  }

  onSubmit() {
    this.submitted = true;

    console.log('saving / updating settings')

    if (this.mainForm.status != "INVALID") {

      this._siteService.updateProductSiteSettings(
        this._hostService.getSiteId(),
        this.mainForm.value.showForm,
        this.mainForm.value.formId
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
    else {
      this._snackBar.open('Please enter your data', '', {
        duration: 2000,
      });
    }

  }

}
