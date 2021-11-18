import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-category-property-dialog',
  templateUrl: './add-category-property-dialog.component.html',
  styleUrls: ['./add-category-property-dialog.component.scss']
})
export class AddCategoryPropertyDialogComponent implements OnInit {

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;
  selectedLang: String;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder, 
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<AddCategoryPropertyDialogComponent>
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit(): void {
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
    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required]
    });    

  }

  onSubmit() {

    this.submitted = true;

    console.log('saving / updating user')

    if (this.mainForm.status != "INVALID") {
      

      let saveService = (!this.data._id) ? 
        this._siteService.addCategoryProperty(
          this._hostService.getSiteId(), 
          this.mainForm.value.name,
          this.selectedLang     
        ) : 
        this._siteService.updateCategoryProperty(
          this._hostService.getSiteId(), 
          this.data._id,
          this.mainForm.value.name,
          this.selectedLang     
        );      

      saveService.subscribe((result: any) => {
            
        if(result.success) {

          console.log(result)
          
          let data = this.mainForm.value;

          //if(!this.data) {
          data['_id'] = result.data;
          //}
          /*
          else {
            data['_id'] = this.data._id;
          }*/

          this._dialogRef.close(data);

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
