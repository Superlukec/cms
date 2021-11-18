import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SiteService } from '../../services/site.service';
import { HostnameService } from '../../services/hostname.service';
import { ConfirmDialogComponent } from '../../utils/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-web-assets',
  templateUrl: './web-assets.component.html',
  styleUrls: ['./web-assets.component.scss']
})
export class WebAssetsComponent implements OnInit {

  private subscription: Subscription;

  files: any = [];

  loading: boolean = true;
  page: string;
  addNew: boolean;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
  ) { 

    this.subscription = this._route.url.subscribe((data) => {

      if(data.length > 2) {
        /**
         * If third parameter
         */
        this.page = this._route.snapshot.paramMap.get('subpage');
        this.addNew = (this.page == 'new');
      }
      
    });

  }

  deleteFile(id) {

    this._siteService.deleteFile(this._hostService.getSiteId(), id).subscribe((result: any) => {

      if (result && result.success) {

        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i]._id == id) {
            this.files.splice(i, 1);
          }
        }

      }
      else {
        this._snackBar.open(result.message, '', {
          duration: 2000,
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

  onFileUpload(file) {
    this.files.push(file);

    this._snackBar.open('File uploaded', '', {
      duration: 2000,
    });
  }

  // bytes to human readable format
  private formatBytes(a,b=2) {
    if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]
  }

  admin_totalFiles() {

    this._siteService.adminTotalFiles(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result) {
        if(result.success) {
          // we show dialog with information
          
          this.confirmDialogRef = this._dialog.open(
            ConfirmDialogComponent,
            {
              width: '350px',
              data: {
                title: 'Total files',
                text: 'Web assets size: ' + this.formatBytes(result.data),
                leftButton: 'Close'
              }
            }
          );

        }
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

  admin_deleteBrokenLinks() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'This will remove all broken links',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.adminDeleteBrokenLinks(this._hostService.getSiteId()).subscribe((result: any) => {

          if(result.success) {

            // we get files one more time
            window.location.reload();   // now

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
    });
    
  }

  admin_showUnusedFiles() {

    this._siteService.adminShowUnusedFiles(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result) {
        if(result.success) {
          // we show dialog with information
          window.location.reload(); 
        }
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

  /*
  admin_deleteUnusedFiles() {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'This will remove all unused files',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.adminDeleteUnusedFiles(this._hostService.getSiteId()).subscribe((result: any) => {

          if(result.success) {

            // we get files one more time
            window.location.reload();   // now

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

    });

  }*/

  ngOnInit() {
    this.page = this._route.snapshot.paramMap.get('subpage');
    this.addNew = (this.page == 'new');
  }

}
