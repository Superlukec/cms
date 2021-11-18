import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ThemeService } from '../../services/theme.service';
import { HostnameService } from '../../services/hostname.service';


@Component({
  selector: 'app-revert-theme-dialog',
  templateUrl: './revert-theme-dialog.component.html',
  styleUrls: ['./revert-theme-dialog.component.scss']
})
export class RevertThemeDialogComponent implements OnInit {


  error: boolean;
  error_msg: string;

  loading: boolean = true;

  variations = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar,
    private _themeService: ThemeService,
    private _hostService: HostnameService,
    private _dialogRef: MatDialogRef<RevertThemeDialogComponent>
  ) { }

  ngOnInit() {

    this._themeService.getThemeVersions(this.data.themeId).subscribe((result: any) => {

      this.loading = false;

      if(result && result.success) {

        this.variations = result.data;

      }
      else {
        this.error = true;
        this.error_msg = result.message;
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

  select(number) {
    this._themeService.revertTheme(this._hostService.getSiteId(), this.data.themeId, number).subscribe((result: any) => {

      if(result && result.success) {
       
        this._dialogRef.close(result.data);

        this._snackBar.open('Theme updated', '', {
          duration: 2000,
        });

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

  preview(number) {
    window.open("/preview/" + this.data.themeId + '/' + number, "_blank");
  }

}
