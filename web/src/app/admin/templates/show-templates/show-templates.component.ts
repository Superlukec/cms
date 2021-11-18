import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { TemplateService } from '../../../services/template.service';
import { HostnameService } from '../../../services/hostname.service';
import { ConfirmDialogComponent } from '../../../utils/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-show-templates',
  templateUrl: './show-templates.component.html',
  styleUrls: ['./show-templates.component.scss']
})
export class ShowTemplatesComponent implements OnInit {

  loading: boolean = true;
  displayedColumns: string[] = ['name', 'author', 'date_created', 'action'];

  templateData: MatTableDataSource<any>;
  resultsLength = 0;

  confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    private _dialog: MatDialog,
    private _templateService: TemplateService,
    private _hostService: HostnameService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this._templateService.getTemplates(this._hostService.getSiteId()).subscribe((result: any) => {

      this.loading = false;  

      if (result.success) {
        this.templateData = new MatTableDataSource(result.data);

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

  delete(id: string) {

    this.confirmDialogRef = this._dialog.open(
      ConfirmDialogComponent,
      {
        width: '350px',
        data: {
          title: 'Are you sure?',
          text: 'That you want to delete this template?',
          leftButton: 'Cancel',
          rightButton: 'Yes'
        },
        disableClose: true
      }
    );

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {


        this._templateService.deleteTemplate(this._hostService.getSiteId(), id).subscribe((result: any) => {

          if (result.success) {

            let dataLength = this.templateData.filteredData.length;

            for (let i = 0; i < dataLength; i++) {

              if (this.templateData.filteredData[i]._id == id) {

                this.templateData.filteredData.splice(i, 1);
                dataLength--;
                this.resultsLength--;

              }

            }

            this.templateData = new MatTableDataSource(this.templateData.filteredData);

          }
          else {
            this._snackBar.open('Error', result.message, {
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
    });

  }

}
