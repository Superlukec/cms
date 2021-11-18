import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SiteService } from '../../../../services/site.service';
import { HostnameService } from '../../../../services/hostname.service';

import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-language',
  templateUrl: './add-language.component.html',
  styleUrls: ['./add-language.component.scss']
})
export class AddLanguageComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _dialogRef: MatDialogRef<AddLanguageComponent>
  ) { }

  ngOnInit() {
    this.createForm();
  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      language: [(data && data.language) ? data.language : '', Validators.required],      
      prefix: [(data && data.prefix) ? data.prefix : '', Validators.required]      
    });
  }

  get f() { return this.mainForm.controls; }

  onSubmit() {
    this.submitted = true;
    
    console.log('saving / updating language')

    if (this.mainForm.status != "INVALID") {

      this._siteService.addSiteLanguage(
        this._hostService.getSiteId(), 
        this.mainForm.value.language,         
        this.mainForm.value.prefix
      ).subscribe((result: any) => {

        if(result.success) {
          
          this._dialogRef.close(result.data);

          this._snackBar.open('Saved', '', {
            duration: 2000,
          });        
        }
        else {
          this._snackBar.open('Error: ', result.message, {
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
