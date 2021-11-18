import { Component, OnInit, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

import { HostnameService } from '../../../../app/services/hostname.service';
import { ConfigService } from '../../../../app/services/config.service';

// import config from '../../../config';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  @Input() assets: boolean;
  @Input() transfer: boolean;
  @Input() restrictFileType: any;
  @Input() dragDrop: boolean = false;

  @Output() data = new EventEmitter<any>();

  options: UploaderOptions;
  formData: FormData;
  file: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  color = 'primary';
  mode = 'determinate';
  progressbarValue = 0;
  percentValue = 0;

  @ViewChild('uploader') uploader: ElementRef;

  constructor(
    private _snackBar: MatSnackBar,
    private cookieService: CookieService,
    private _hostService: HostnameService,
    private _config: ConfigService
  ) {
    this.options = { concurrency: 0 };
    this.file = null; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
  }

  onUploadOutput(output: UploadOutput): void {

    this.uploader.nativeElement.value = '';

    console.warn(output)

    switch (output.type) {
      case 'allAddedToQueue':

      console.error(this.file)

        const event: UploadInput = {
          type: 'uploadFile',
          url: this._config.getApiUrl() + ((this.assets) ? '/api/site/upload/asset' : '/api/site/upload/shareable'),
          file: this.file,
          headers: { 'Authorization': this.cookieService.get('jwtToken') },
          method: 'POST',
          data: { 
            site_id: this._hostService.getSiteId(), 
            transfer: (this.transfer) ? 'true' : 'false'
          }
        };        
        
        this.uploadInput.emit(event);

        break;
      case 'addedToQueue':
        if (typeof output.file !== 'undefined') {
          this.file = output.file;
        }
        break;
      case 'uploading':
        if (typeof output.file !== 'undefined') {
          this.file = output.file;
          
          this.progressbarValue = output.file.progress.data.percentage;
          this.percentValue = this.progressbarValue;
        }
        break;
      case 'removed':
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
          this._snackBar.open('Only .jpg and .png files are alowed', '', {
            duration: 2000,
          });

          this.file = null;
        }
        break;
      case 'done':

        this.progressbarValue = 0;
        this.percentValue = 0;

        if (output.file.response) {

          if (output.file.response.success == true) {

            let file = output.file.response.data;

            if (this._config.isDevelopment() && file.url) {
              file.url = 'http://localhost:1339' + file.url;
            }

            if (this.data) {
              this.data.emit(file);
            }

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

  ngOnInit() {

  }

}
