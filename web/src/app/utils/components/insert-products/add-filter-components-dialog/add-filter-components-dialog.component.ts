import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../../../services/site.service';
import { HostnameService } from '../../../../services/hostname.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-filter-components-dialog',
  templateUrl: './add-filter-components-dialog.component.html',
  styleUrls: ['./add-filter-components-dialog.component.scss']
})
export class AddFilterComponentsDialogComponent implements OnInit {

  loading: boolean = true;
  
  lang: string; 
  categories: any[] = [];
  properties: any[] = [];

  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar,
    private _dialogRef: MatDialogRef<AddFilterComponentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  addAndSave(): void {

    let selectedElements = [];

    for(let cat of this.categories) {

      if(cat.selected) {

        selectedElements.push({
          is_property: false,
          category: cat._id,
          name: cat.name,
          properties: (cat.properties) ? cat.properties : []
        });

      }
      
    }

    for(let prop of this.properties) {

      if(prop.selected) {
        
        selectedElements.push({
          is_property: true,    
          property: prop._id,     
          name: prop.name
        });

      }
      
    }

    this._dialogRef.close(selectedElements);

  }

  ngOnInit(): void {

    if(this.data) {
      this.lang = this.data.lang;


      this._siteService.getCategoryProperties(this._hostService.getSiteId(), this.lang).subscribe((result: any) => {


        if (result.success) {

          this.categories = result.data;

        }

        this._siteService.getProperties(this._hostService.getSiteId(), this.lang).subscribe((result: any) => {

          this.loading = false;

          if (result.success) {

            this.properties = result.data;
           
          }

        }, err => {
          if (err.status != 200) {
            this._snackBar.open('Error on the server', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }, err => {
        if (err.status != 200) {
          this._snackBar.open('Error on the server', '', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });


    }

  }

}
