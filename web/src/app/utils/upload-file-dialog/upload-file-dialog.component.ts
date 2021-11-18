import { Component, OnInit, EventEmitter, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput } from 'ngx-uploader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

import { ThemeService } from '../../../app/services/theme.service';
import { HostnameService } from '../../../app/services/hostname.service';
import { ConfigService } from '../../../app/services/config.service';

// import config from '../../config';



@Component({
  selector: 'app-upload-file-dialog',
  templateUrl: './upload-file-dialog.component.html',
  styleUrls: ['./upload-file-dialog.component.scss']
})
export class UploadFileDialogComponent implements OnInit {

  status: boolean = true;
  files = [{
      name: 'footer.html',
      success: true
    },
    {
      name: 'header.html',
      success: true
    },
    {
      name: 'script.js',
      success: true
    },
    {
      name: 'style.css',
      success: true
  }];
  loaded: boolean;

  options: UploaderOptions;
  formData: FormData;
  file: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  color = 'primary';
  mode = 'determinate';
  value = 0;

  @ViewChild('uploader') uploader: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar,    
    private cookieService: CookieService,
    private _themeService: ThemeService,
    private _hostService: HostnameService,
    private _dialogRef: MatDialogRef<UploadFileDialogComponent>,
    private _config: ConfigService
  ) { 
    this.options = { 
      concurrency: 0,
      allowedContentTypes: ['application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'multipart/x-zip']
    };
    this.file = null; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = this.humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {

    this.uploader.nativeElement.value = '';

    console.log(output)
    switch (output.type) {
      case 'allAddedToQueue':
        
        const event: UploadInput = {
          type: 'uploadFile',
          url: this._config.getApiUrl() + '/api/theme/load/' + this.data.themeId,
          file: this.file,
          headers: { 'Authorization': this.cookieService.get('jwtToken') },
          method: 'POST',
          data: { 
            site_id: this._hostService.getSiteId() 
          }
        };

        this.uploadInput.emit(event);

        break;
      case 'addedToQueue':
        if (typeof output.file !== 'undefined') {
          this.file = output.file;
          //console.log(this.files)
        }
        break;
      case 'uploading':
        if (typeof output.file !== 'undefined') {

          // update current data in files array for uploading file
          //const index = this.files.findIndex((file) => typeof output.file !== 'undefined' && file.id === output.file.id);
          //this.files[index] = output.file;
          this.file = output.file;
          this.value = output.file.progress.data.percentage;
        }
        break;
      case 'removed':
        // remove file from array when removed
        this.file = null;
        break;
      case 'dragOver':
        this.dragOver = true;
        break;
      case 'dragOut':
      case 'drop':
        this.dragOver = false;
        break;
      case 'rejected':
        if (typeof output.file !== 'undefined') {
          //toastr.error('Only .jpg and .png files are alowed');         
          this._snackBar.open('Only .zip files are alowed', '', {
            duration: 2000,
          });

          this.file = null;
        }
        break;
      case 'done':

        if (output.file.response) {

          let response = output.file.response;

          if (response.success == true) {

            this.loaded = true;


          }
          else {

            if (response.zip != undefined) {
                
              if(response.zip == true) {

                this.loaded = true;

                let error = false;


                for(let i = 0; i < response.file.length; i++) {

                  for(let j = 0; j < this.files.length; j++) {

                    if(response.file[i] == this.files[j].name) {
                      this.files[j].success = false;
                      error = true;
                    }

                  }

                }

                if(error) {
                  this.status = false;
                }
                else {
                  this.status = true;
                }

              } 
              else {

                this._snackBar.open('Error: ' + response.message, '', {
                  duration: 2000,
                  panelClass: ['error-snackbar']
                });

              }

            }
            else {
              this._snackBar.open('Error: ' + response.message, '', {
                duration: 2000,
                panelClass: ['error-snackbar']
              });
            }

          }

        }
        else {
          this._snackBar.open('Something went wrong, please try again.', '', {
            duration: 2000,
          });
        }

        this.file = null;
        break;
    }

  }

  reloadTheme() {   

    this._themeService.deleteUploadFolder(      
      this.data.themeId
    ).subscribe((result: any) => {

      for(let i = 0; i < this.files.length; i++) {
        this.files[i].success = true;
      }

      this.status = true;
      this.loaded = false;
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

  ngOnInit() {
  }

  proceed() {

    if(this.status && this.loaded) {

      this._themeService.restoreTheme(      
        this.data.themeId,
        this._hostService.getSiteId()
      ).subscribe((result: any) => {
      

        if(result.success) {
          //this.loaded = false;
          this._dialogRef.close(result.data);

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
      this._snackBar.open('Please load correct file', '', {
        duration: 2000,
      });
    }

  }

  cancel() {

    if(this.loaded) {
      this._themeService.deleteUploadFolder(      
        this.data.themeId
      ).subscribe((result: any) => {
        this._dialogRef.close();
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
      this._dialogRef.close();
    }
  }


}
