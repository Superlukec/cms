import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { ShareableService } from '../../../services/shareable.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfigService } from '../../../services/config.service';

//import config from '../../../config';

@Component({
  selector: 'app-show-portal-specific-shareable',
  templateUrl: './show-portal-specific-shareable.component.html',
  styleUrls: ['./show-portal-specific-shareable.component.scss']
})
export class ShowPortalSpecificShareableComponent implements OnInit {

  private webUrl; // = config.api_url;

  found: boolean = true;
  shareable: any;
  
  @Input() id: string;

  constructor(
    private titleService: Title,
    private _hostService: HostnameService,  
    private _shareableService: ShareableService,
    private _snackBar: MatSnackBar,
    private _config: ConfigService
  ) { 
  }

  ngOnInit() {
    this.titleService.setTitle('Portal');
    this.webUrl = this._config.getApiUrl();

    this._shareableService.getShareable(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

      if(result.success) {
        this.shareable = result.data;
      }
      else {
        this.found = false;

        this._snackBar.open(result.message, '', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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

  //#region file manipulation
  prepareDownload(id: string) {
    
    this._shareableService.downloadFile(this._hostService.getSiteId(), this.id, id).subscribe((result: any) => {

      if(result && result.success) {
        window.open(this.webUrl + "/download/" + result.data, "_blank");
      }
      else {
        this._snackBar.open(result.message, '', {
          duration: 2000,
        });
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

  prepareZip() {

    this._shareableService.downloadZip(this._hostService.getSiteId(), this.id).subscribe((result: any) => {

      if(result && result.success) {
        window.open(this.webUrl + "/download/zip/" + result.data, "_blank");
      }
      else {
        this._snackBar.open(result.message, '', {
          duration: 2000,
        });
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
  //#endregion

}
