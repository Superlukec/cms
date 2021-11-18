import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { SiteService } from '../../../../app/services/site.service';
import { HostnameService } from '../../../../app/services/hostname.service';



@Component({
  selector: 'app-show-forms',
  templateUrl: './show-forms.component.html',
  styleUrls: ['./show-forms.component.scss']
})
export class ShowFormsComponent implements OnInit {


  loading: boolean = true;
  displayedColumns: string[] = ['name', 'author', 'date_created'];

  formsData: MatTableDataSource<any>;
  resultsLength = 0;
  
  constructor(
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this._siteService.getForms(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;  

      if (result.success) {
        this.formsData = new MatTableDataSource(result.data);

        this.resultsLength = result.data.length;
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

}
