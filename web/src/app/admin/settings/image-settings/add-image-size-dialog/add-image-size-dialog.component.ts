import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SiteService } from '../../../../services/site.service';
import { SlugifyService } from '../../../../services/slugify.service';
import { HostnameService } from '../../../../services/hostname.service';

import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-image-size-dialog',
  templateUrl: './add-image-size-dialog.component.html',
  styleUrls: ['./add-image-size-dialog.component.scss']
})
export class AddImageSizeDialogComponent implements OnInit {

  mainForm: FormGroup;
  submitted = false;

  constructor(
    private _fb: FormBuilder,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService,
    private _dialogRef: MatDialogRef<AddImageSizeDialogComponent>,
    private _slugify: SlugifyService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

   /**
   * We create the form
   * @param data
   */
  createForm(data?) {
    this.mainForm = this._fb.group({
      name: [(data && data.name) ? data.name : '', Validators.required],      
      width: [(data && data.width) ? data.width : '', [Validators.required]],      
      height: [(data && data.height) ? data.height : null],     
      algorithm: [(data && data.algorithm) ? data.algorithm : 'center', [Validators.required]]      
    });
  }

  get f() { return this.mainForm.controls; }

  onSubmit() {
    this.submitted = true;
    
    if (this.mainForm.status != "INVALID") {

      this.mainForm.patchValue({
        name: this._slugify.slugify(this.mainForm.value.name)
      });

      if( isNaN(this.mainForm.value.width) ) {
        return this._snackBar.open('Please enter number for width', '', {
          duration: 2000,
        });
      }

      if( this.mainForm.value.height && isNaN(this.mainForm.value.height) ) {
        return this._snackBar.open('Please enter number for height', '', {
          duration: 2000,
        });
      }

      this._siteService.addImageSize(
        this._hostService.getSiteId(), 
        this.mainForm.value.name,         
        this.mainForm.value.width,         
        this.mainForm.value.height,         
        this.mainForm.value.algorithm,         
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
