import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';
import { SiteService } from '../../../../app/services/site.service';
import { HostnameService } from '../../../../app/services/hostname.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-form-submissions',
  templateUrl: './form-submissions.component.html',
  styleUrls: ['./form-submissions.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class FormSubmissionsComponent implements OnInit {

  selectedForm: string;

  loading: boolean = true;
  displayedColumns: string[] = ['date_created', 'ip', 'location', 'emailSent'];

  formsList : any = [];
  formsData: MatTableDataSource<any>;
  resultsLength = 0;
  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _siteService: SiteService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this._siteService.getForms(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;  

      if (result.success) {
       
        this.formsList = result.data;

        if(this.formsList.length > 0) {
          this.selectedForm = this.formsList[0]._id;
          this.getFormSubmissions(this.selectedForm);
        }


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

  onFormChange(formId: string) {
    this.getFormSubmissions(formId);
  }

  getFormSubmissions(formId: string) {
    this._siteService.getFormsSubmissions(this._hostService.getSiteId(), this.selectedForm).subscribe((result: any) => {

      if(result && result.success) {
        this.formsData = new MatTableDataSource(result.data);
        this.resultsLength = result.data.length;
      }
      else {
        this.formsData = new MatTableDataSource([]);
        this.resultsLength = 0;
      }

    }, (err) => {
      if (err.status != 200) {
        this._snackBar.open('Error on the server', '', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeAll(id: string) {
    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete all submissions (this action is irreversible)?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {

        this._siteService.deleteFormsSubmissions(this._hostService.getSiteId(), this.selectedForm).subscribe((result: any) => {
         
            this.formsData = new MatTableDataSource([]);
            this.resultsLength = 0;          
    
        }, (err) => {
          if (err.status != 200) {
            this._snackBar.open('Error on the server', '', {
              duration: 2000,
              panelClass: ['error-snackbar']
            });
          }
        });

      }
    });
  }

}
