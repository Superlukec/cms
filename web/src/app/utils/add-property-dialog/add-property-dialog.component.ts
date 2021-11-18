import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-property-dialog',
  templateUrl: './add-property-dialog.component.html',
  styleUrls: ['./add-property-dialog.component.scss']
})
export class AddPropertyDialogComponent implements OnInit {

  loading: Boolean = true;

  mainForm: FormGroup;
  submitted = false;
  selectedLang: String;

  categories: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder, 
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<AddPropertyDialogComponent>
  ) { }

  get f() { return this.mainForm.controls; }

  ngOnInit() {

    if(this.data) {
      if(this.data['availableLanguages']) {
        if(!this.selectedLang && this.data.availableLanguages.length > 0) {
          for(let lang of this.data.availableLanguages) {
            if(lang.main) {
              this.selectedLang = lang.prefix;
            }
          }
        }
      }

      if(this.data['lang_prefix']) {
        this.selectedLang = this.data.lang_prefix;
      }

      if(this.data['categories']) {
        this.categories = this.data['categories'];

        for(let cat of this.categories) {
          cat.selected = false;
        }

        if(this.data['category'] && this.data['category'].length > 0) {

          for(let cat of this.data['category']) {

            for(let cat2 of this.categories) {

              if(cat == cat2._id) {
                cat2.selected = true;
              }

            }

          }
          
        }

      }

      this.createForm(this.data);

    }
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

      let _selectedCategory = [];

      /**
       * We add the selected categories
       */
      for(let cat of this.categories) {

        if(cat.selected) {
          _selectedCategory.push(cat._id);
        }

      }

      let saveService = (!this.data._id) ? 
        this._siteService.addProperty(
          this._hostService.getSiteId(), 
          this.mainForm.value.name,
          this.selectedLang,
          _selectedCategory
        ) : 
        this._siteService.updateProperty(
          this._hostService.getSiteId(), 
          this.data._id,
          this.mainForm.value.name,
          this.selectedLang,
          _selectedCategory   
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
