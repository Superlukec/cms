import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-brand-dialog',
  templateUrl: './brand-dialog.component.html',
  styleUrls: ['./brand-dialog.component.scss']
})
export class BrandDialogComponent implements OnInit {

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;
  selectedLang: String;
  editing: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder, 
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<BrandDialogComponent>
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {

    if(this.data && this.data['availableLanguages']) {
      if(!this.selectedLang && this.data.availableLanguages.length > 0) {
        for(let lang of this.data.availableLanguages) {
          if(lang.main) {
            this.selectedLang = lang.prefix;
          }
        }
      }
    }

    if(this.data && this.data['lang_prefix']) {
      this.selectedLang = this.data.lang_prefix;
    }

    this.createForm(this.data);
    this.loading = false;
  }

  /**
   * We create the form
   * @param data
   */
  createForm(data?) {

    if(data && data._id) {
      this.editing = true;
    }

    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],
      description: [(data && data.description) ? data.description : '', Validators.required],
      logo: [(data && data.logo) ? data.logo : ''],
    });    

  }

  /**
   * CKEditor - getting the data
   * @param id 
   * @param value 
   */
  onCkEditorValue(value) {
    this.mainForm.patchValue({
      description: value
    });
  }

   /**
   * On image upload module
   * @param id 
   * @param html 
   */
  onImageUpload(img) {
    this.mainForm.patchValue({
      logo: img
    });
  }

  /**
   * On delete image module
   * @param id 
   * @param html 
   */
  onDelete() {   
    this.mainForm.patchValue({
      logo: null
    });
  }


  onSubmit() {

    this.submitted = true;

    console.log('saving / updating user')

    if (this.mainForm.status != "INVALID") {


      let saveService = (!this.data._id) ? 
        this._siteService.addBrand(
          this._hostService.getSiteId(), 
          this.mainForm.value.name,
          this.mainForm.value.description,
          this.mainForm.value.logo,
          this.selectedLang          
        ) : 
        this._siteService.updateBrand(
          this._hostService.getSiteId(), 
          this.data._id,
          this.mainForm.value.name,
          this.mainForm.value.description,
          this.mainForm.value.logo,
          this.selectedLang
        );      

      saveService.subscribe((result: any) => {
            
        if(result.success) {
          
          let brandData = this.mainForm.value;

          if(!this.data) {
            brandData['_id'] = result.data;
          }
          else {
            brandData['_id'] = this.data._id;
          }

          this._dialogRef.close(brandData);

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

}
