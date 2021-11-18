import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ExistingFileComponent } from '../existing-file/existing-file.component';
//import config from '../../../config';

import { HostnameService } from '../../../../app/services/hostname.service';
import { ConfigService } from '../../../../app/services/config.service';



@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent implements OnInit {

  imagePath: String;
  image: String;

  @Input() small: string;
  @Input() favicon: string;
  @Input() set img(val: any) {

    if(typeof val === 'object') {

      if(val && val.url) {
        this.image = val.url;
        this.imagePath = val.url;
      }

    }
    else {

      this.image = val;
      this.imagePath = val;

    }
    
  }
  @Input() multiple: Boolean;
  
  @Output() data = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  options: UploaderOptions;
  formData: FormData;
  file: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  color = 'primary';
  mode = 'determinate';
  value = 0;

  existingFileDialogRef: MatDialogRef<ExistingFileComponent>;

  constructor(
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private cookieService: CookieService,
    private _hostService: HostnameService,
    private _config: ConfigService
  ) { 
    this.options = { concurrency: 0, allowedContentTypes: ['image/jpeg', 'image/png', 'image/x-icon'] };
    this.file = null; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {
    //console.log(output)
    switch (output.type) {
      case 'allAddedToQueue':
        // uncomment this if you want to auto upload files when added
        // const event: UploadInput = {
        //   type: 'uploadAll',
        //   url: '/upload',
        //   method: 'POST',
        //   data: { foo: 'bar' }
        // };
        // this.uploadInput.emit(event);


        const event: UploadInput = {
          type: 'uploadFile',
          url: this._config.getApiUrl() + '/api/site/upload/image',
          file: this.file,
          headers: { 'Authorization': this.cookieService.get('jwtToken') },
          method: 'POST',
          data: { 
            site_id: this._hostService.getSiteId(),
            favicon: (this.favicon) ? 'true' : 'false'
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
        if(typeof output.file !== 'undefined') {
          //toastr.error('Only .jpg and .png files are alowed');         
          this._snackBar.open('Only .jpg and .png files are alowed', '', {
            duration: 2000,
          });
          
          this.file = null;
        }
        break;
      case 'done':

        if(output.file.response) {

          if(output.file.response.success == true) {

            let image = output.file.response.data;

            if(this._config.isDevelopment()) {
              image.url = 'http://localhost:1339' + image.url;
            }

            this.imagePath = image.url;

            this.data.emit(output.file.response.data);           
          
          }
          else {
            this._snackBar.open('Error: ' + output.file.response.message, '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }

        }
        else {
          this._snackBar.open('Something went wrong, please try again.', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }        

        this.file = null;
        break;
    }
  }

  deleteImage() {
    this.imagePath = null;

    this.delete.emit(true);
  }

  ngOnInit() {
    
    if(this.image) {

      this.imagePath = this.image;

    }

  }

  chooseImage() {
     
    this.existingFileDialogRef = this._dialog.open(
      ExistingFileComponent,
      {
        width: '750px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this menu?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        }
      }
    );

    this.existingFileDialogRef.afterClosed().subscribe(image => {
      if (image) {
        this.data.emit(image); 

        if(this._config.isDevelopment()) {
          image.url = 'http://localhost:1339' + image.url;
        }

        this.imagePath = image.url;

      }
    });

  }

}
