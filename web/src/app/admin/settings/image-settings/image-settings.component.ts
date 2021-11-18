import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { FormCheckerService } from '../../../services/form-checker.service';
import { AddImageSizeDialogComponent } from './add-image-size-dialog/add-image-size-dialog.component';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-image-settings',
  templateUrl: './image-settings.component.html',
  styleUrls: ['./image-settings.component.scss']
})
export class ImageSettingsComponent implements OnInit {

  private formSubscription: Subscription;

  loading: boolean = true;

  mainForm: FormGroup;
  submitted = false;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
  addImageSizeDialogRef: MatDialogRef<AddImageSizeDialogComponent>;

  imageSize: any = [];

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _fb: FormBuilder,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _formCheckerService: FormCheckerService
  ) { }

  ngOnInit(): void {

    this._siteService.getSettingsSiteInfo(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;  

      if (result.success) {
        
        this.imageSize = (result.data.image_size) ? result.data.image_size : [];

        this.createForm(this.imageSize);

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

    this.mainForm = this._fb.group({      
      imageSize: this.imageSize
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
  
  deleteImageSize(position: Number) {


    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this image size?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteImageSize(
          this._hostService.getSiteId(), 
          position
        ).subscribe((result: any) => {
  
          if(result.success) {
            this.imageSize.splice(position, 1);                  
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

    });

  }

  addImageSize() {
    this.addImageSizeDialogRef = this._dialog.open(
      AddImageSizeDialogComponent,
      {
        width: '450px',
        data: null
      }
    );

    this.addImageSizeDialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.imageSize = result;
        }
    });
  
  }


  regenerateImageSize() {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to regenerate all images?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        console.log('Working ...')

        this._siteService.regenerateImageSizes(
          this._hostService.getSiteId()
        ).subscribe((result: any) => {
          
          console.log(result);

          if(result.success) {
            this._snackBar.open('Done', '', {
              duration: 2000
            });
          }
          else {
            this._snackBar.open(result.message, '', {
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
    });

  }

}
