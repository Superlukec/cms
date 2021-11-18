import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../../services/site.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss']
})
export class ThemesComponent implements OnInit {

  loading: Boolean = true;

  myThemes: any = [];
  themeMarket: any = [];

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _snackBar: MatSnackBar,
    private _hostService: HostnameService
  ) { }

  ngOnInit() {


    this._siteService.getInstalledThemes(this._hostService.getSiteId()).subscribe((result: any) => {

      if(result.success) {   
        
        console.log(result.data)

        this.myThemes = result.data;
        this.loading = false;

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

    this.themeMarket= [
      {
        title: 'Default theme',
        installed: true     
      }, 
      {
        title: 'First theme'
      },
      {
        title: 'Second theme'
      }
    ];

  }

  selectTheme(themeId: string) {
    
    this._siteService.selectTheme(this._hostService.getSiteId(), themeId).subscribe((result: any) => {

      if(result.success) {       

        // theme is selected

        for(let theme of this.myThemes) {

          if(theme._id == themeId) {
            theme.selected = true;
          }
          else {
            theme.selected = false;
          }

        }


      }
      else {

        // show error
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

  deleteTheme(themeId: string, selected: boolean) {

    if(selected) {


      this.confirmDialogRef = this._dialog.open(
        ConfirmDialogComponent,
        {
          width: '350px',
          data: {
            title: 'Action disabled',
            text: 'You can\'t delete active theme (selected)',
            leftButton: 'OK'
          }
        }
      );

    } 
    else{

      this.confirmDialogRef = this._dialog.open(
        ConfirmDialogComponent,
        {
          width: '350px',
          data: {
            title: 'Are you sure?',
            text: 'That you want to delete this theme?',
            leftButton: 'Cancel',
            rightButton: 'Yes'
          },
          disableClose: true
        }
      );

      this.confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {

          this._siteService.deleteTheme(this._hostService.getSiteId(), themeId).subscribe((result: any) => {

            if(result.success) {       
      
              // theme is selected
              let themesLength = this.myThemes.length;
      
              for(let i = 0; i < themesLength; i++) {

                if(this.myThemes[i]._id == themeId) {
                  this.myThemes.splice(i, 1);
                  themesLength--;
                  i--;
                }

              }    
      
            }
            else {
      
              // show error
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

  }

}
